import Script from "../../../models/Script";

export const scriptMutations = {
    createScript: async (_: any, { title, visibility, language }: any) => {
        try {
            const newScript = new Script({ title, visibility, language });
            await newScript.save();
            return newScript;
        } catch (error: any) {
            throw new Error(`Failed to create script: ${error.message}`);
        }
    },
};
