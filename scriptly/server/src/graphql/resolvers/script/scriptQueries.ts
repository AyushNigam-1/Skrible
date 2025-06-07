import mongoose from "mongoose";
import Script from "../../../models/Script";
import User from "../../../models/User";

export const scriptQueries = {
    getAllScripts: async () => {
        try {
            const scripts = await Script.find()
                .populate("author")
                .populate("requests.author");
            return scripts;
        } catch (error: any) {
            throw new Error(`Failed to fetch scripts: ${error.message}`);
        }
    },

    getScriptById: async (_: any, { id }: { id: string }) => {
        try {
            const script = await Script.findById(id)
                .populate("author")
                .populate("requests.author");

            if (!script) {
                throw new Error("Script not found");
            }

            // Filter only pending requests if needed
            script.requests = script.requests.filter(req => req.status === "pending");

            return script;
        } catch (error: any) {
            throw new Error(`Failed to fetch script: ${error.message}`);
        }
    },

    getScriptsByGenres: async (_: any, { genres }: { genres?: string[] }) => {
        try {
            const filter = genres && genres.length > 0
                ? { genres: { $in: genres } }
                : {};

            const scripts = await Script.find(filter)
                .populate("author")
                .populate("requests.author");
            return scripts;
        } catch (error: any) {
            throw new Error(`Failed to fetch scripts by genres: ${error.message}`);
        }
    },

    getScriptContributors: async (_: any, { scriptId }: { scriptId: string }) => {
        const script = await Script.findById(scriptId)
            .populate("requests.author")
            .lean();

        if (!script) {
            throw new Error("Script not found");
        }

        const paragraphIds = script.paragraphs.map(id => id.toString());

        const paragraphRequests = script.requests.filter(req =>
            paragraphIds.includes(req._id.toString())
        );

        const authorMap: Map<string, { name: string; paragraphs: any[] }> = new Map();

        for (const request of paragraphRequests) {
            const authorId = request.author.toString();

            if (!authorMap.has(authorId)) {
                authorMap.set(authorId, { name: "", paragraphs: [] });
            }

            authorMap.get(authorId)!.paragraphs.push(request);
        }

        const users = await User.find({ _id: { $in: Array.from(authorMap.keys()) } })
            .lean()
            .select("_id username");

        for (const user of users) {
            const mapEntry = authorMap.get(user._id.toString());
            if (mapEntry) mapEntry.name = user.username;
        }

        const contributors = Array.from(authorMap.entries()).map(([userId, details]) => ({
            userId,
            details,
        }));

        return { contributors };
    },
};
