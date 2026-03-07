import Script from "../../../models/Script";
import Paragraph from "../../../models/Paragraph";

export const scriptQueries = {
  getAllScripts: async () => {
    return Script.find().populate("author");
  },

  getScriptById: async (_: any, { id }: { id: string }) => {
    const script = await Script.findById(id)
      .populate("author")
      .populate({
        path: "paragraphs",
        populate: [{ path: "author" }, { path: "comments.author" }],
      });

    if (!script) throw new Error("Script not found");

    return script;
  },

  getScriptsByGenres: async (_: any, { genres }: { genres?: string[] }) => {
    const filter = genres && genres.length ? { genres: { $in: genres } } : {};

    return Script.find(filter).populate("author");
  },

  getScriptContributors: async (_: any, { scriptId }: { scriptId: string }) => {
    const paragraphs = await Paragraph.find({
      script: scriptId,
      status: "approved",
    })
      .populate("author")
      .lean();

    const authorMap: Map<string, any> = new Map();

    for (const p of paragraphs) {
      const id = p.author._id.toString();

      if (!authorMap.has(id)) {
        authorMap.set(id, { name: p.author, paragraphs: [] });
      }

      authorMap.get(id).paragraphs.push(p);
    }

    return {
      contributors: Array.from(authorMap.entries()).map(
        ([userId, details]) => ({
          userId,
          details,
        }),
      ),
    };
  },
};
