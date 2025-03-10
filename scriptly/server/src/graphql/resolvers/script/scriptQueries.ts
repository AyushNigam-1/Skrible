import mongoose from "mongoose";
import Script from "../../../models/Script";
import User from "../../../models/User";
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
    },
    getScriptsByGenres: async (_: any, { genres }: { genres?: string[] }) => {
        try {
            console.log(genres)
            const filter = genres && Array.isArray(genres) && genres.length > 0
                ? { genres: { $in: genres } }
                : {}; // If genres array is empty, return all scripts
            console.log(filter)
            const scripts = await Script.find(filter);
            return scripts;
        } catch (error: any) {
            throw new Error(`Failed to fetch scripts by genres: ${error.message}`);
        }
    },
    getScriptContributors: async (_: any, { scriptId }: { scriptId: string }) => {
        const script = await Script.findById(scriptId).lean();

        if (!script) {
            throw new Error("Script not found");
        }

        // Extract unique author IDs from paragraphs
        const authorMap: Map<string, { name: string; paragraphs: any[] }> = new Map();

        for (const paragraph of script.paragraphs) {
            const authorId = paragraph.author.toString();

            if (!authorMap.has(authorId)) {
                authorMap.set(authorId, { name: "", paragraphs: [] });
            }

            authorMap.get(authorId)!.paragraphs.push(paragraph);
        }

        // Fetch user details
        const users = await User.find({ _id: { $in: Array.from(authorMap.keys()) } })
            .lean()
            .select("_id username");
        console.log(users)
        // Map user details into authorMap
        for (const user of users) {
            if (authorMap.has(user._id.toString())) {
                authorMap.get(user._id.toString())!.name = user.username;
            }
        }

        // Convert to expected structure
        const contributors = Array.from(authorMap.entries()).map(([userId, details]) => ({
            userId,
            details,
        }));
        console.log(contributors)
        return { contributors };
    },


};

