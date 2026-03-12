import { GraphQLError } from "graphql";
import Script from "../../../models/Script";
import Paragraph from "../../../models/Paragraph";
import User from "../../../models/User";

interface MyContext {
  redis: any;
  user: any;
  req: any;
}

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
      `Too many requests for ${action}. Please try again later.`,
      {
        extensions: { code: "TOO_MANY_REQUESTS", http: { status: 429 } },
      },
    );
  }
};

const toUnixString = (date: any) => {
  if (!date) return null;
  return new Date(date).getTime().toString();
};

export const userQueries = {
  getUserProfile: async (
    _: unknown,
    { id }: { id: string },
    context: MyContext,
  ) => {
    const ip =
      context.req?.ip || context.req?.socket?.remoteAddress || "unknown_ip";
    await enforceRateLimit(context.redis, ip, "get_user_profile", 100, 60);

    const cacheKey = `user:${id}:profile:v3`;

    const cachedProfile = await context.redis.get(cacheKey);
    if (cachedProfile) {
      return JSON.parse(cachedProfile);
    }

    const user = await User.findById(id)
      .populate("scripts")
      .populate("follows");

    if (!user) throw new Error("User not found");

    const obj: any = user.toObject({ virtuals: true });

    obj.createdAt = toUnixString(obj.createdAt);
    obj.updatedAt = toUnixString(obj.updatedAt);

    obj.favourites = obj.favourites || [];
    obj.languages = obj.languages || [];
    obj.likes = obj.likes || [];
    obj.followers = obj.followers || [];
    obj.views = obj.views || [];

    obj.follows = (obj.follows || []).map((follow: any) => ({
      ...follow,
      createdAt: toUnixString(follow.createdAt),
      updatedAt: toUnixString(follow.updatedAt),
    }));

    obj.scripts = (obj.scripts || []).map((script: any) => ({
      ...script,
      createdAt: toUnixString(script.createdAt),
      updatedAt: toUnixString(script.updatedAt),
    }));

    await context.redis.setEx(cacheKey, 3600, JSON.stringify(obj));

    return obj;
  },

  getUserScripts: async (
    _: unknown,
    { userId }: { userId: string },
    context: MyContext,
  ) => {
    const ip =
      context.req?.ip || context.req?.socket?.remoteAddress || "unknown_ip";
    await enforceRateLimit(context.redis, ip, "get_user_scripts", 100, 60);

    const cacheKey = `user:${userId}:scripts:v3`;

    const cachedScripts = await context.redis.get(cacheKey);
    if (cachedScripts) {
      return JSON.parse(cachedScripts);
    }

    const scripts = await Script.find({ author: userId }).populate("author");

    const formattedScripts = scripts.map((script: any) => {
      const obj: any = script.toObject({ virtuals: true });
      return {
        ...obj,
        createdAt: toUnixString(obj.createdAt),
        updatedAt: toUnixString(obj.updatedAt),
        author: obj.author
          ? {
              ...obj.author,
              createdAt: toUnixString(obj.author.createdAt),
              updatedAt: toUnixString(obj.author.updatedAt),
            }
          : null,
      };
    });

    await context.redis.setEx(cacheKey, 3600, JSON.stringify(formattedScripts));

    return formattedScripts;
  },

  getUserContributions: async (
    _: any,
    { userId }: { userId: string },
    context: MyContext,
  ) => {
    const ip =
      context.req?.ip || context.req?.socket?.remoteAddress || "unknown_ip";
    await enforceRateLimit(
      context.redis,
      ip,
      "get_user_contributions",
      100,
      60,
    );

    const cacheKey = `user:${userId}:contributions:v3`;

    const cachedContributions = await context.redis.get(cacheKey);
    if (cachedContributions) {
      return JSON.parse(cachedContributions);
    }

    const paragraphs = await Paragraph.find({ author: userId })
      .populate("script")
      .populate("comments.author")
      .sort({ createdAt: -1 });

    const result = paragraphs.map((p: any) => {
      const obj: any = p.toObject({ virtuals: true });

      return {
        ...obj,
        createdAt: toUnixString(obj.createdAt),
        updatedAt: toUnixString(obj.updatedAt),

        script: obj.script
          ? {
              ...obj.script,
              id: p.script._id?.toString() || p.script.id?.toString(),
              title: p.script.title,
              createdAt: toUnixString(obj.script.createdAt),
              updatedAt: toUnixString(obj.script.updatedAt),
            }
          : null,

        comments: (obj.comments || []).map((comment: any) => ({
          ...comment,
          createdAt: toUnixString(comment.createdAt),
          updatedAt: toUnixString(comment.updatedAt),
          author: comment.author
            ? {
                ...comment.author,
                createdAt: toUnixString(comment.author.createdAt),
                updatedAt: toUnixString(comment.author.updatedAt),
              }
            : null,
        })),
      };
    });

    await context.redis.setEx(cacheKey, 600, JSON.stringify(result));

    return result;
  },

  getUserFavourites: async (
    _: unknown,
    { userId }: { userId: string },
    context: MyContext,
  ) => {
    const ip =
      context.req?.ip || context.req?.socket?.remoteAddress || "unknown_ip";
    await enforceRateLimit(context.redis, ip, "get_user_favourites", 100, 60);

    const cacheKey = `user:${userId}:favourites:v3`;

    const cachedFavs = await context.redis.get(cacheKey);
    if (cachedFavs) {
      return JSON.parse(cachedFavs);
    }

    const user = await User.findById(userId).populate({
      path: "favourites",
      populate: {
        path: "author",
        select: "username createdAt updatedAt",
      },
    });

    if (!user) throw new Error("User not found");

    const formattedFavs = (user.favourites || []).map((fav: any) => {
      const obj: any = fav.toObject ? fav.toObject({ virtuals: true }) : fav;

      return {
        ...obj,
        createdAt: toUnixString(obj.createdAt),
        updatedAt: toUnixString(obj.updatedAt),
        author: obj.author
          ? {
              ...obj.author,
              createdAt: toUnixString(obj.author.createdAt),
              updatedAt: toUnixString(obj.author.updatedAt),
            }
          : null,
      };
    });

    await context.redis.setEx(cacheKey, 3600, JSON.stringify(formattedFavs));

    return formattedFavs;
  },
};
