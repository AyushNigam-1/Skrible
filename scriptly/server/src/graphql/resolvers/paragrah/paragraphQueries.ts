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
    }
}
