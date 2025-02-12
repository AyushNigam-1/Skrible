import Script from "../../../models/Script";

export const scriptQueries = {
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
            const script = await Script.findById(id).populate("author").populate("paragraphs.author").populate("requests.author");
            if (!script) {
                throw new Error("Script not found");
            }
            console.log(script)
            return script;
        } catch (error: any) {
            throw new Error(`Failed to fetch script: ${error.message}`);
        }
    }

};
