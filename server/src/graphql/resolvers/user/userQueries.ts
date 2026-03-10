import Script from "../../../models/Script";
import Paragraph from "../../../models/Paragraph";
import User from "../../../models/User";

interface MyContext {
  redis: any;
  user: any;
}

export const userQueries = {
  getUserProfile: async (
    _: unknown,
    { id }: { id: string },
    { redis }: MyContext,
  ) => {
    const cacheKey = `user:${id}:profile`;

    // 1. Check Redis Cache
    const cachedProfile = await redis.get(cacheKey);
    if (cachedProfile) {
      return JSON.parse(cachedProfile);
    }

    // 2. Fetch from DB (Removed .lean() to preserve virtuals)
    const user = await User.findById(id)
      .populate("scripts")
      .populate("follows");

    if (!user) throw new Error("User not found");

    // ERROR FIX: Generate the object with virtuals so nested scripts/follows get their 'id'
    const result = user.toObject({ virtuals: true });

    // Ensure fallback arrays just in case
    result.favourites = result.favourites || [];
    result.languages = result.languages || [];
    result.likes = result.likes || [];
    result.followers = result.followers || [];
    result.scripts = result.scripts || [];
    result.views = result.views || [];

    // 3. Save to Redis (Cache for 1 hour / 3600 seconds)
    await redis.setEx(cacheKey, 3600, JSON.stringify(result));

    return result;
  },

  getUserScripts: async (
    _: unknown,
    { userId }: { userId: string },
    { redis }: MyContext,
  ) => {
    // 🚨 CACHE BUSTING: We added ':v2' to force Redis to fetch fresh data! 🚨
    const cacheKey = `user:${userId}:scripts:v2`;

    const cachedScripts = await redis.get(cacheKey);
    if (cachedScripts) {
      return JSON.parse(cachedScripts);
    }

    // We use lean() here so we just get raw JSON, no Mongoose magic
    const scripts = await Script.find({ author: userId })
      .populate("author")
      .lean();

    // HYPER-DEFENSIVE: Manually force the '_id' string into the 'id' property
    const formattedScripts = scripts.map((script: any) => ({
      ...script,
      id: script._id.toString(), // 100% guaranteed to be a string

      author: script.author
        ? {
            ...script.author,
            id: script.author._id.toString(), // 100% guaranteed to be a string
          }
        : null,
    }));

    // Save the newly formatted, correct data to Redis
    await redis.setEx(cacheKey, 3600, JSON.stringify(formattedScripts));

    return formattedScripts;
  },

  getUserContributions: async (
    _: any,
    { userId }: { userId: string },
    { redis }: MyContext,
  ) => {
    const cacheKey = `user:${userId}:contributions`;

    const cachedContributions = await redis.get(cacheKey);
    if (cachedContributions) {
      return JSON.parse(cachedContributions);
    }

    const paragraphs = await Paragraph.find({ author: userId })
      .populate("script")
      .populate("comments.author")
      .sort({ createdAt: -1 });

    // HYPER-DEFENSIVE MAPPING: Prevents server crashes if relations are missing
    const result = paragraphs.map((p: any) => {
      const formatted = p.toObject({ virtuals: true });

      return {
        ...formatted,
        id: p._id?.toString(),
        createdAt: p.createdAt ? new Date(p.createdAt).toString() : "",

        // Safely handle the script even if it was deleted or didn't populate correctly
        script: p.script
          ? {
              ...formatted.script,
              id: p.script._id?.toString() || p.script.id?.toString(),
            }
          : null,

        // Safely handle comments and their authors
        comments: (p.comments || []).map((comment: any) => ({
          ...(comment.toObject
            ? comment.toObject({ virtuals: true })
            : comment),
          id: comment._id?.toString(),
          author: comment.author
            ? {
                ...(comment.author.toObject
                  ? comment.author.toObject({ virtuals: true })
                  : comment.author),
                id:
                  comment.author._id?.toString() ||
                  comment.author.id?.toString(),
              }
            : null,
        })),
      };
    });

    await redis.setEx(cacheKey, 600, JSON.stringify(result));

    return result;
  },

  getUserFavourites: async (
    _: unknown,
    { userId }: { userId: string },
    { redis }: MyContext,
  ) => {
    const cacheKey = `user:${userId}:favourites`;

    const cachedFavs = await redis.get(cacheKey);
    if (cachedFavs) {
      return JSON.parse(cachedFavs);
    }

    const user = await User.findById(userId).populate({
      path: "favourites",
      populate: {
        path: "author",
        select: "username",
      },
    }); // Removed .lean()

    if (!user) throw new Error("User not found");

    // ERROR FIX: Map over the populated array to inject virtual 'id's
    const formattedFavs = (user.favourites || []).map((fav: any) =>
      fav.toObject ? fav.toObject({ virtuals: true }) : fav,
    );

    // Cache for 1 hour
    await redis.setEx(cacheKey, 3600, JSON.stringify(formattedFavs));

    return formattedFavs;
  },
};
