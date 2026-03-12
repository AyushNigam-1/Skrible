import { GraphQLError } from "graphql";
import User from "../../../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { Types } from "mongoose";
import crypto from "crypto";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const COOKIE_NAME = "jwt";
const REFRESH_COOKIE_NAME = "refresh_jwt";

const ACCESS_TOKEN_EXPIRY = "15m";
const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;

const REFRESH_TOKEN_EXPIRY = "7d";
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const REDIS_REFRESH_EXPIRY = 7 * 24 * 60 * 60;

const enforceRateLimit = async (
  redis: any,
  identifier: string,
  action: string,
  limit: number,
  windowSeconds: number,
) => {
  if (!redis) return;

  const key = `ratelimit:${action}:${identifier}`;
  const currentCount = await redis.incr(key);

  if (currentCount === 1) {
    await redis.expire(key, windowSeconds);
  }

  if (currentCount > limit) {
    throw new GraphQLError(
      `Too many attempts for ${action}. Please try again later.`,
      {
        extensions: { code: "TOO_MANY_REQUESTS", http: { status: 429 } },
      },
    );
  }
};

export const userMutations = {
  register: async (
    _: any,
    {
      username,
      password,
      email,
    }: { username: string; password: string; email?: string },
    { req, res, redis }: { req: Request; res: Response; redis: any },
  ) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
    await enforceRateLimit(redis, ip, "register", 5, 3600);

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new GraphQLError("Username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY },
    );

    const nonce = crypto.randomBytes(16).toString("hex");
    const refreshToken = jwt.sign(
      { id: newUser._id, nonce },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY },
    );

    if (redis) {
      await redis.setEx(
        `refresh:${newUser._id}:${nonce}`,
        REDIS_REFRESH_EXPIRY,
        "valid",
      );
    }

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: "/",
    });

    return {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      token,
      languages: newUser.languages,
      bio: newUser.bio,
      likes: newUser.likes,
      followers: newUser.followers,
      views: newUser.views,
      scripts: newUser.scripts,
      follows: newUser.follows,
    };
  },

  login: async (
    _: any,
    { username, password }: { username: string; password: string },
    { req, res, redis }: { req: Request; res: Response; redis: any },
  ) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
    await enforceRateLimit(redis, ip, "login", 10, 900);

    const user = await User.findOne({ username });
    if (!user) {
      throw new GraphQLError("Invalid username or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new GraphQLError("Invalid username or password");
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY },
    );

    const nonce = crypto.randomBytes(16).toString("hex");
    const refreshToken = jwt.sign({ id: user._id, nonce }, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });

    if (redis) {
      await redis.setEx(
        `refresh:${user._id}:${nonce}`,
        REDIS_REFRESH_EXPIRY,
        "valid",
      );
    }

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: "/",
    });

    if (redis) await redis.del(`ratelimit:login:${ip}`);

    return {
      id: user._id,
      username: user.username,
      email: user.email,
      token,
      languages: user.languages,
      bio: user.bio,
      likes: user.likes,
      followers: user.followers,
      views: user.views,
      scripts: user.scripts,
      follows: user.follows,
    };
  },

  refreshToken: async (
    _: any,
    __: any,
    { req, res, redis }: { req: Request; res: Response; redis: any },
  ) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
    await enforceRateLimit(redis, ip, "refresh_token", 20, 60);

    const incomingRefreshToken = req.cookies[REFRESH_COOKIE_NAME];
    if (!incomingRefreshToken) {
      throw new GraphQLError("No refresh token provided", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(incomingRefreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      throw new GraphQLError("Invalid refresh token", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    const { id, nonce } = decoded;
    const redisKey = `refresh:${id}:${nonce}`;
    const isValid = await redis.get(redisKey);

    if (!isValid) {
      const keys = await redis.keys(`refresh:${id}:*`);
      if (keys.length > 0) {
        await redis.del(keys);
      }
      res.clearCookie(COOKIE_NAME);
      res.clearCookie(REFRESH_COOKIE_NAME);
      throw new GraphQLError(
        "Security Alert: Token replay detected. All sessions revoked.",
        {
          extensions: { code: "UNAUTHENTICATED" },
        },
      );
    }

    await redis.del(redisKey);

    const user = await User.findById(id);
    if (!user) {
      throw new GraphQLError("User not found");
    }

    const newAccessToken = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY },
    );

    const newNonce = crypto.randomBytes(16).toString("hex");
    const newRefreshToken = jwt.sign(
      { id: user._id, nonce: newNonce },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY },
    );

    await redis.setEx(
      `refresh:${user._id}:${newNonce}`,
      REDIS_REFRESH_EXPIRY,
      "valid",
    );

    res.cookie(COOKIE_NAME, newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: "/",
    });

    return { token: newAccessToken };
  },

  logout: async (
    _: unknown,
    __: unknown,
    { req, res, redis }: { req: Request; res: Response; redis: any },
  ) => {
    const refreshToken = req.cookies[REFRESH_COOKIE_NAME];
    if (refreshToken && redis) {
      try {
        const decoded: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET, {
          ignoreExpiration: true,
        });
        await redis.del(`refresh:${decoded.id}:${decoded.nonce}`);
      } catch (e) {}
    }

    if (res) {
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
    }
    return true;
  },

  toggleBookmark: async (
    _: any,
    { scriptId }: { scriptId: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) {
      throw new GraphQLError("User not authenticated", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    await enforceRateLimit(context.redis, userId, "bookmark", 30, 60);

    const user = await User.findById(userId);
    if (!user) throw new GraphQLError("User not found");

    const targetId = new Types.ObjectId(scriptId);
    const isBookmarked = user.favourites?.some((id) => id.equals(targetId));

    if (isBookmarked) {
      await User.findByIdAndUpdate(userId, {
        $pull: { favourites: targetId },
      });
    } else {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { favourites: targetId },
      });
    }

    return { status: true };
  },

  updateUserProfileField: async (
    _: any,
    { key, value }: { key: string; value: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) {
      throw new GraphQLError("User not authenticated", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    await enforceRateLimit(context.redis, userId, "update_profile", 20, 60);

    const validStringFields = ["username", "bio"];
    const validArrayFields = ["languages", "interests"];

    let formattedValue: any = value;

    if (validArrayFields.includes(key)) {
      formattedValue = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    } else if (!validStringFields.includes(key)) {
      throw new GraphQLError(
        `Invalid field: ${key} cannot be updated directly.`,
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { [key]: formattedValue } },
      { new: true },
    );

    if (!updatedUser) throw new GraphQLError("User not found");

    return updatedUser;
  },

  likeProfile: async (
    _: any,
    { profileId }: { profileId: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) {
      throw new GraphQLError("User not authenticated", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }
    if (userId === profileId)
      throw new GraphQLError("Cannot like your own profile");

    await enforceRateLimit(context.redis, userId, "like_profile", 30, 60);

    const targetUser = await User.findById(profileId);
    if (!targetUser) throw new GraphQLError("Profile not found");

    const hasLiked = targetUser.likes?.includes(userId) || false;

    if (hasLiked) {
      await User.findByIdAndUpdate(profileId, {
        $pull: { likes: userId },
      });
    } else {
      await User.findByIdAndUpdate(profileId, {
        $addToSet: { likes: userId },
      });
    }

    return { status: true };
  },

  viewProfile: async (
    _: any,
    { profileId }: { profileId: string },
    context: any,
  ) => {
    const userId = context.user?.id;

    if (!userId || userId === profileId) {
      return { status: false };
    }

    await enforceRateLimit(context.redis, userId, "view_profile", 10, 60);

    await User.findByIdAndUpdate(profileId, {
      $addToSet: { views: userId },
    });

    return { status: true };
  },
};
