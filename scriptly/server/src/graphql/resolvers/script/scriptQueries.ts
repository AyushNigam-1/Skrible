import Script from "../../../models/Script";

export const scriptQueries = {
    getParagraphWithParentScript: async (_: unknown, { paragraphId }: { paragraphId: string }) => {
        const script = await Script.findOne(
            { 'paragraphs._id': paragraphId },
            { title: 1, 'paragraphs.$': 1 }
        );

        if (!script || script.paragraphs.length === 0) {
            throw new Error('Paragraph not found.');
        }

        return {
            scriptId: script._id,
            title: script.title,
            paragraph: script.paragraphs[0],
        };
    },

    getAllScripts: async () => {
        try {
            const scripts = await Script.find();
            return scripts;
        } catch (error: any) {
            throw new Error(`Failed to fetch scripts: ${error.message}`);
        }
    },

    getScriptById: async (_: any, { id }: { id: string }) => {
        try {
            const script = await Script.findById(id);
            if (!script) {
                throw new Error('Script not found');
            }
            return script;
        } catch (error: any) {
            throw new Error(`Failed to fetch script: ${error.message}`);
        }
    },
};
