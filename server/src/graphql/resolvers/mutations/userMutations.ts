import { GraphQLError } from "graphql";
import User from "../../../models/User";
import dotenv from "dotenv";
import { Types } from "mongoose";

dotenv.config();

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

  // 🚨 register, login, refreshToken, and logout were DELETED! 🚨
  // Better Auth handles them via /api/auth/* now.

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
      await User.findByIdAndUpdate(userId, { $pull: { favourites: targetId } });
    } else {
      await User.findByIdAndUpdate(userId, { $addToSet: { favourites: targetId } });
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

    // 🚨 Updated to use "name" instead of "username"
    const validStringFields = ["name", "bio"];
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
      await User.findByIdAndUpdate(profileId, { $pull: { likes: userId } });
    } else {
      await User.findByIdAndUpdate(profileId, { $addToSet: { likes: userId } });
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