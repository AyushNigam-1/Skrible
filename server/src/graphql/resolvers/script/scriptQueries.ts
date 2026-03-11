import Script from "../../../models/Script";
import Paragraph from "../../../models/Paragraph";

interface MyContext {
  redis: any;
  user: any;
}

// THE FIX: Forces dates back into the Unix timestamp strings your frontend relies on
const toUnixString = (date: any) => {
  if (!date) return null;
  return new Date(date).getTime().toString();
};

export const scriptQueries = {
  getAllScripts: async (_: any, __: any, { redis }: MyContext) => {
    const cacheKey = "scripts:all:v2";

    const cachedScripts = await redis.get(cacheKey);
    if (cachedScripts) {
      return JSON.parse(cachedScripts);
    }

    const scripts = await Script.find().populate("author");

    const formattedScripts = scripts.map((script) => {
      // FIX: Cast to 'any' so TS allows us to mutate Date fields into strings
      const obj: any = script.toObject({ virtuals: true });
      return {
        ...obj,
        createdAt: toUnixString(obj.createdAt),
        updatedAt: toUnixString(obj.updatedAt),
      };
    });

    await redis.setEx(cacheKey, 300, JSON.stringify(formattedScripts));

    return formattedScripts;
  },

  getScriptById: async (
    _: any,
    { id }: { id: string },
    { redis }: MyContext,
  ) => {
    const cacheKey = `script:${id}:v2`;

    const cachedScript = await redis.get(cacheKey);
    if (cachedScript) {
      return JSON.parse(cachedScript);
    }

    const script = await Script.findById(id)
      .populate("author")
      .populate("collaborators.user")
      .populate({
        path: "paragraphs",
        populate: [{ path: "author" }, { path: "comments.author" }],
      });

    if (!script) throw new Error("Script not found");

    // FIX: Cast to 'any' so we can safely overwrite the strict Date types
    const obj: any = script.toObject({ virtuals: true });

    obj.createdAt = toUnixString(obj.createdAt);
    obj.updatedAt = toUnixString(obj.updatedAt);

    if (obj.paragraphs) {
      obj.paragraphs = obj.paragraphs.map((p: any) => ({
        ...p,
        createdAt: toUnixString(p.createdAt),
        updatedAt: toUnixString(p.updatedAt),
        comments: (p.comments || []).map((c: any) => ({
          ...c,
          createdAt: toUnixString(c.createdAt),
          updatedAt: toUnixString(c.updatedAt),
        })),
      }));
    }

    await redis.setEx(cacheKey, 3600, JSON.stringify(obj));

    return obj;
  },

  getScriptsByGenres: async (
    _: any,
    { genres }: { genres?: string[] },
    { redis }: MyContext,
  ) => {
    const genresKey =
      genres && genres.length ? genres.slice().sort().join(",") : "all";
    const cacheKey = `scripts:genres:${genresKey}:v2`;

    const cachedScripts = await redis.get(cacheKey);
    if (cachedScripts) {
      return JSON.parse(cachedScripts);
    }

    const filter = genres && genres.length ? { genres: { $in: genres } } : {};
    const scripts = await Script.find(filter).populate("author");

    const formattedScripts = scripts.map((script) => {
      // FIX: Cast to 'any'
      const obj: any = script.toObject({ virtuals: true });
      return {
        ...obj,
        createdAt: toUnixString(obj.createdAt),
        updatedAt: toUnixString(obj.updatedAt),
      };
    });

    await redis.setEx(cacheKey, 300, JSON.stringify(formattedScripts));

    return formattedScripts;
  },

  getScriptContributors: async (
    _: any,
    { scriptId }: { scriptId: string },
    { redis }: MyContext,
  ) => {
    const cacheKey = `script:${scriptId}:contributors:v2`;

    const cachedContributors = await redis.get(cacheKey);
    if (cachedContributors) {
      return JSON.parse(cachedContributors);
    }

    const paragraphs = await Paragraph.find({
      script: scriptId,
      status: "approved",
    }).populate("author");

    const formattedParagraphs = paragraphs.map((p) => {
      // FIX: Cast to 'any'
      const obj: any = p.toObject({ virtuals: true });
      return {
        ...obj,
        createdAt: toUnixString(obj.createdAt),
        updatedAt: toUnixString(obj.updatedAt),
      };
    });

    const authorMap: Map<string, any> = new Map();

    for (const p of formattedParagraphs) {
      const author: any = p.author;
      const authorId = String(author.id || author._id);

      if (!authorMap.has(authorId)) {
        authorMap.set(authorId, { name: author, paragraphs: [] });
      }

      authorMap.get(authorId).paragraphs.push(p);
    }

    const result = {
      contributors: Array.from(authorMap.entries()).map(
        ([userId, details]) => ({
          userId,
          details,
        }),
      ),
    };

    await redis.setEx(cacheKey, 1800, JSON.stringify(result));

    return result;
  },
};
