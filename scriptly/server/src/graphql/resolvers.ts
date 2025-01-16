import Script from "../models/Script";
    
    
export const resolvers = {
  Query: {
    getAllScripts: async () => {
      try {
          const scripts = await Script.find();
          console.log(scripts)
          return scripts;
      } catch (error:any) {
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
      } catch (error:any) {
        throw new Error(`Failed to fetch script: ${error.message}`);
      }
    },
  },

  Mutation: {
    createScript: async (_: any, { title,visibility,language }: any) => {
      try {
        const newScript = new Script(title,visibility,language);
        await newScript.save();
        return newScript;
      } catch (error:any) {
        throw new Error(`Failed to create script: ${error.message}`);
      }
    },
  },
};
