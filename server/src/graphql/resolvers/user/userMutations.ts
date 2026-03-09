import { GraphQLError } from "graphql";
import User from "../../../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { Types } from "mongoose";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "jwt";

export const userMutations = {
  register: async (
    _: any,
    {
      username,
      password,
      email,
    }: { username: string; password: string; email?: string },
    { res }: { res: Response },
  ) => {
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
      { expiresIn: "1D" },
    );

    // Set the token in the cookie
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false, // Secure only in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "lax" for local testing
      maxAge: 24 * 60 * 60 * 1000, // 1 day
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
    { res }: { res: Response },
  ) => {
    console.log("Response Headers Before Setting Cookie:", res.getHeaders());

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
      { expiresIn: "1D" },
    );

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false, // Secure only in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "lax" for local testing
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return {
      id: user._id,
      username: user.username,
      email: user.email,
      token, // You can return the token in the response as well, if needed
      languages: user.languages,
      bio: user.bio,
      likes: user.likes,
      followers: user.followers,
      views: user.views,
      scripts: user.scripts,
      follows: user.follows,
    };
  },
  logout: (
    _: unknown,
    __: unknown,
    {
      req,
      res,
    }: {
      req: Request;
      res: Response;
    },
  ): boolean => {
    if (res) {
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
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
      throw new GraphQLError("User not authenticated");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new GraphQLError("User not found");
    }

    // Convert the string scriptId into a Mongoose ObjectId for comparison
    const targetId = new Types.ObjectId(scriptId);

    // Check if already bookmarked using the converted ID
    const isBookmarked = user.favourites?.some((id) => id.equals(targetId));

    if (isBookmarked) {
      // Remove from bookmarks
      await User.findByIdAndUpdate(userId, {
        $pull: { favourites: targetId },
      });
    } else {
      // Add to bookmarks
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
      throw new GraphQLError("User not authenticated");
    }

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

    if (!updatedUser) {
      throw new GraphQLError("User not found");
    }

    return updatedUser;
  },
  // Inside your Mutation resolvers
  likeProfile: async (
    _: any,
    { profileId }: { profileId: string },
    context: any,
  ) => {
    const userId = context.user?.id;
    if (!userId) throw new GraphQLError("User not authenticated");

    // Optional: Prevent users from liking their own profile
    if (userId === profileId)
      throw new GraphQLError("Cannot like your own profile");

    const targetUser = await User.findById(profileId);
    if (!targetUser) throw new GraphQLError("Profile not found");

    const hasLiked = targetUser.likes?.includes(userId) || false;

    if (hasLiked) {
      await User.findByIdAndUpdate(profileId, {
        $pull: { likes: userId },
      });
    } else {
      await User.findByIdAndUpdate(profileId, {
        $addToSet: { likes: userId }, // $addToSet prevents duplicates
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

    // If the user is not logged in, or is viewing their own profile, ignore the view count
    if (!userId || userId === profileId) {
      return { status: false };
    }

    // $addToSet will safely ignore the operation if the userId is already in the views array
    await User.findByIdAndUpdate(profileId, {
      $addToSet: { views: userId },
    });

    return { status: true };
  },
};
