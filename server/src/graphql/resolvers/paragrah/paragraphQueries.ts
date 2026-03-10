import jsPDF from "jspdf";
import Paragraph from "../../../models/Paragraph";
import Script from "../../../models/Script";

interface MyContext {
  redis: any;
  user: any;
}

export const paragraphQueries = {
  getParagraphById: async (
    _: any,
    { paragraphId }: { paragraphId: string },
    { redis }: MyContext,
  ) => {
    const cacheKey = `paragraph:${paragraphId}`;

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

    const result = paragraph.toObject({ virtuals: true });
    result.likes = result.likes?.map((id: any) => id.toString()) || [];
    result.dislikes = result.dislikes?.map((id: any) => id.toString()) || [];

    // 3. Save to Redis (Cache for 1 hour = 3600 seconds)
    await redis.setEx(cacheKey, 3600, JSON.stringify(result));

    return result;
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
    const cacheKey = `script:${scriptId}:pending`;

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

    // Cache for 5 minutes (300 seconds) since pending requests change frequently
    await redis.setEx(cacheKey, 300, JSON.stringify(paragraphs));

    return paragraphs;
  },

  exportDocument: async (
    _: any,
    { scriptId, format }: { scriptId: string; format: string },
    { redis }: MyContext,
  ) => {
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
