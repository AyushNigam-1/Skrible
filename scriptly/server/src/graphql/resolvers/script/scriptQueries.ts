import mongoose from "mongoose";
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
        console.log(id)
        try {
            const scriptAggregation = await Script.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(id) } }, // Match script by ID
                {
                    $addFields: {
                        requests: {
                            $filter: {
                                input: "$requests",
                                as: "request",
                                cond: { $eq: ["$$request.status", "pending"] }
                            }
                        }
                    }
                }
            ])

            if (!scriptAggregation.length) {
                throw new Error("Script not found");
            }

            // Step 2: Convert the aggregation result into a Mongoose document
            const script = await Script.hydrate(scriptAggregation[0]);

            // Step 3: Populate required fields
            await script.populate("author");
            await script.populate("paragraphs.author");
            await script.populate("requests.author");
            // console.
            return script;
        } catch (error: any) {
            throw new Error(`Failed to fetch script: ${error.message}`);
        }
    }


};
