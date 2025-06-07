import jsPDF from "jspdf";
import Script from "../../../models/Script";
import User from "../../../models/User";

export const paragraphQueries = {
    getParagraphById: async (_: any, { paragraphId }: { paragraphId: string }) => {
        try {
            const script = await Script.findOne({
                "requests._id": paragraphId,
                paragraphs: paragraphId, // ensure it's referenced in paragraphs
            }, {
                "requests.$": 1,
            });

            if (!script || !script.requests.length) {
                throw new Error("Paragraph not found");
            }

            const request = script.requests[0];
            const author = await User.findById(request.author);

            return {
                ...request,
                author, // manually populated
            };
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
        console.log(scriptId, format)
        try {
            const script = await Script.findById(scriptId);
            console.log(script)
            if (!script) {
                throw new Error("Script not found");
            }

            const sanitizedTitle = script.title.replace(/[<>:"/\\|?*]+/g, ""); // Remove invalid filename characters

            if (format === "txt") {
                console.log({
                    filename: `${sanitizedTitle}.txt`,
                    content: script.combinedText,
                    contentType: "text/plain"
                })
                return {
                    filename: `${sanitizedTitle}.txt`,
                    content: script.combinedText,
                    contentType: "text/plain"
                };
            }
            if (format === "md") {
                return {
                    filename: `${sanitizedTitle}.md`,
                    content: script.combinedText, // If you have markdown formatting, ensure it's applied here
                    contentType: "text/markdown"
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
