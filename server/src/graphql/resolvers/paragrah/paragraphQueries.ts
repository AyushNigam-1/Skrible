import jsPDF from "jspdf";
import Paragraph from "../../../models/Paragraph";
import Script from "../../../models/Script";

interface MyContext {
  redis: any;
  user: any;
}

// THE FIX: Forces dates back into the Unix timestamp strings your frontend relies on
const toUnixString = (date: any) => {
  if (!date) return null;
  return new Date(date).getTime().toString();
};

export const paragraphQueries = {
  getParagraphById: async (
    _: any,
    { paragraphId }: { paragraphId: string },
    { redis }: MyContext,
  ) => {
    // 🚨 CACHE BUSTING
    const cacheKey = `paragraph:${paragraphId}:v3`;

    // 1. Check Redis Cache
    const cachedParagraph = await redis.get(cacheKey);
    if (cachedParagraph) {
      return JSON.parse(cachedParagraph);
    }

    // 2. Fetch from DB if not in cache
    const paragraph = await Paragraph.findById(paragraphId)
      .populate("author")
      .populate("comments.author")
      .populate({
        path: "script",
        populate: [{ path: "collaborators.user" }, { path: "author" }],
      });

    if (!paragraph) throw new Error("Paragraph not found");

    // FIX: Cast to 'any' so we can overwrite Date fields
    const obj: any = paragraph.toObject({ virtuals: true });
    obj.likes = obj.likes?.map((id: any) => id.toString()) || [];
    obj.dislikes = obj.dislikes?.map((id: any) => id.toString()) || [];

    // Safely force all nested dates back to Unix strings
    obj.createdAt = toUnixString(obj.createdAt);
    obj.updatedAt = toUnixString(obj.updatedAt);

    if (obj.author) {
      obj.author.createdAt = toUnixString(obj.author.createdAt);
      obj.author.updatedAt = toUnixString(obj.author.updatedAt);
    }

    if (obj.script) {
      obj.script.createdAt = toUnixString(obj.script.createdAt);
      obj.script.updatedAt = toUnixString(obj.script.updatedAt);
      if (obj.script.author) {
        obj.script.author.createdAt = toUnixString(obj.script.author.createdAt);
        obj.script.author.updatedAt = toUnixString(obj.script.author.updatedAt);
      }
    }

    if (obj.comments) {
      obj.comments = obj.comments.map((c: any) => ({
        ...c,
        createdAt: toUnixString(c.createdAt),
        updatedAt: toUnixString(c.updatedAt),
        author: c.author
          ? {
              ...c.author,
              createdAt: toUnixString(c.author.createdAt),
              updatedAt: toUnixString(c.author.updatedAt),
            }
          : null,
      }));
    }

    // 3. Save to Redis (Cache for 1 hour = 3600 seconds)
    await redis.setEx(cacheKey, 3600, JSON.stringify(obj));

    return obj;
  },

  getCombinedText: async (
    _: any,
    { scriptId }: { scriptId: string },
    { redis }: MyContext,
  ) => {
    const cacheKey = `script:${scriptId}:combinedText`;

    const cachedText = await redis.get(cacheKey);
    if (cachedText) {
      return cachedText;
    }

    const script = await Script.findById(scriptId).lean();
    if (!script) throw new Error("Script not found");

    const text = script.combinedText || "";

    // Cache for 1 hour
    await redis.setEx(cacheKey, 3600, text);

    return text;
  },

  getPendingParagraphs: async (
    _: any,
    { scriptId }: { scriptId: string },
    { redis }: MyContext,
  ) => {
    // 🚨 CACHE BUSTING
    const cacheKey = `script:${scriptId}:pending:v3`;

    const cachedPending = await redis.get(cacheKey);
    if (cachedPending) {
      return JSON.parse(cachedPending);
    }

    // Added .lean() here to make it easier to serialize into Redis
    const paragraphs = await Paragraph.find({
      script: scriptId,
      status: "pending",
    })
      .populate("author")
      .sort({ createdAt: -1 })
      .lean();

    // ERROR FIX: Re-map the lean array to inject IDs and fix Dates
    const formattedParagraphs = paragraphs.map((p: any) => ({
      ...p,
      id: p._id?.toString(),
      createdAt: toUnixString(p.createdAt),
      updatedAt: toUnixString(p.updatedAt),
      author: p.author
        ? {
            ...p.author,
            id: p.author._id?.toString(),
            createdAt: toUnixString(p.author.createdAt),
            updatedAt: toUnixString(p.author.updatedAt),
          }
        : null,
    }));

    // Cache for 5 minutes (300 seconds) since pending requests change frequently
    await redis.setEx(cacheKey, 300, JSON.stringify(formattedParagraphs));

    return formattedParagraphs;
  },

  exportDocument: async (
    _: any,
    { scriptId, format }: { scriptId: string; format: string },
    { redis }: MyContext,
  ) => {
    // Export data does not get parsed by your standard React components, so no date fix needed here
    const cacheKey = `script:${scriptId}:exportData`;

    let script;
    const cachedScript = await redis.get(cacheKey);

    if (cachedScript) {
      script = JSON.parse(cachedScript);
    } else {
      script = await Script.findById(scriptId).lean();
      if (!script) throw new Error("Script not found");

      // Cache the raw script data for 1 hour to speed up future exports
      await redis.setEx(cacheKey, 3600, JSON.stringify(script));
    }

    const sanitizedTitle = script.title.replace(/[<>:"/\\|?*]+/g, "");

    if (format === "txt") {
      return {
        filename: `${sanitizedTitle}.txt`,
        content: script.combinedText || "",
        contentType: "text/plain",
      };
    }

    if (format === "md") {
      return {
        filename: `${sanitizedTitle}.md`,
        content: script.combinedText || "",
        contentType: "text/markdown",
      };
    }

    if (format === "pdf") {
      const doc = new jsPDF();
      const text = script.combinedText || "No content available";

      const pageWidth = doc.internal.pageSize.getWidth() - 20;
      const wrappedText = doc.splitTextToSize(text, pageWidth);
      doc.text(wrappedText, 10, 10);

      const pdfBase64 = doc.output("dataurlstring").split(",")[1];

      return {
        filename: `${sanitizedTitle}.pdf`,
        content: pdfBase64,
        contentType: "application/pdf",
      };
    }

    throw new Error("Invalid format");
  },
};
