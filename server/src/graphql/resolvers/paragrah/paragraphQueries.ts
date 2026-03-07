import jsPDF from "jspdf";
import Paragraph from "../../../models/Paragraph";
import Script from "../../../models/Script";

export const paragraphQueries = {
  getParagraphById: async (
    _: any,
    { paragraphId }: { paragraphId: string },
  ) => {
    const paragraph = await Paragraph.findById(paragraphId)
      .populate("author")
      .populate("comments.author")
      .populate({
        path: "script",
        populate: [{ path: "collaborators.user" }, { path: "author" }],
      });

    if (!paragraph) throw new Error("Paragraph not found");

    // 1. Convert the Mongoose document to a plain JavaScript object
    // { virtuals: true } ensures all the 'id' fields are generated from '_id'
    const result = paragraph.toObject({ virtuals: true });

    // 2. Safely stringify the raw ObjectIds in the arrays
    result.likes = result.likes?.map((id: any) => id.toString()) || [];
    result.dislikes = result.dislikes?.map((id: any) => id.toString()) || [];

    return result;
  },

  getCombinedText: async (_: any, { scriptId }: { scriptId: string }) => {
    const script = await Script.findById(scriptId).lean();

    if (!script) throw new Error("Script not found");

    return script.combinedText || "";
  },

  getPendingParagraphs: async (_: any, { scriptId }: { scriptId: string }) => {
    const paragraphs = await Paragraph.find({
      script: scriptId,
      status: "pending",
    })
      .populate("author")
      .sort({ createdAt: -1 });

    return paragraphs;
  },
  exportDocument: async (
    _: any,
    { scriptId, format }: { scriptId: string; format: string },
  ) => {
    const script = await Script.findById(scriptId).lean();

    if (!script) throw new Error("Script not found");

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
