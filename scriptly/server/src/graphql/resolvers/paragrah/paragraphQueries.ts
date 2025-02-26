import jsPDF from "jspdf";
import Script from "../../../models/Script";


export const paragraphQueries = {
    getParagraphById: async (_: any, { paragraphId }: { paragraphId: string }) => {
        try {
            const script = await Script.findOne({ "paragraphs._id": paragraphId }, { "paragraphs.$": 1 }).populate("paragraphs.author");
            if (!script || !script.paragraphs.length) {
                throw new Error("Paragraph not found");
            }
            return script.paragraphs[0];
        } catch (error: any) {
            throw new Error(`Failed to fetch paragraph: ${error.message}`);
        }
    },
    getCombinedText: async (_: any, { scriptId }: { scriptId: string }) => {
        try {
            const script = await Script.findById(scriptId, { combinedText: 1 });
            if (!script) {
                throw new Error("Script not found");
            }
            return script.combinedText;
        } catch (error: any) {
            throw new Error(`Failed to fetch combined text: ${error.message}`);
        }
    },
    exportDocument: async (_: any, { scriptId, format }: { scriptId: string; format: string }) => {
        try {
            const script = await Script.findById(scriptId, { title: 1, combinedText: 1 });
            if (!script) {
                throw new Error("Script not found");
            }

            const sanitizedTitle = script.title.replace(/[<>:"/\\|?*]+/g, ""); // Remove invalid filename characters

            if (format === "txt") {
                return {
                    filename: `${sanitizedTitle}.txt`,
                    content: script.combinedText,
                    contentType: "text/plain"
                };
            }

            if (format === "pdf") {
                const doc = new jsPDF();
                const text = script.combinedText || "No content available";

                const pageWidth = doc.internal.pageSize.getWidth() - 20; // 10px margin on both sides
                const wrappedText = doc.splitTextToSize(text, pageWidth);
                doc.text(wrappedText, 10, 10);

                // Generate base64
                const pdfBase64 = doc.output("dataurlstring").split(",")[1];

                if (!pdfBase64 || pdfBase64.length % 4 !== 0 || /[^A-Za-z0-9+/=]/.test(pdfBase64)) {
                    console.error("Invalid Base64 generated on server:", pdfBase64);
                    throw new Error("Invalid Base64 generated");
                }

                return {
                    filename: `${sanitizedTitle}.pdf`,
                    content: pdfBase64,
                    contentType: "application/pdf"
                };
            }

            throw new Error("Invalid format");
        } catch (error: any) {
            throw new Error(`Failed to export document: ${error.message}`);
        }
    }

}
