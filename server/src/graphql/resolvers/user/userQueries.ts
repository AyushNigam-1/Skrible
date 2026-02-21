import Script from "../../../models/Script";
import Paragraph from "../../../models/Paragraph";
import User from "../../../models/User";

export const userQueries = {
    getUserProfile: async (_: unknown, { username }: { username: string }) => {
        const user = await User.findOne({ username })
            .populate("scripts")
            .populate("likes")
            .populate("followers")
            .populate("follows")
            .populate("views");

        if (!user) throw new Error("User not found");

        return {
            id: user._id,
            username: user.username,
            email: user.email,
            bio: user.bio,
            languages: user.languages || [],
            likes: user.likes || [],
            followers: user.followers || [],
            follows: user.follows || [],
            scripts: user.scripts || [],
            views: user.views || [],
        };
    },

    getUserScripts: async (_: unknown, { userId }: { userId: string }) => {
        const scripts = await Script.find({ author: userId }).populate("author");

        if (!scripts.length) throw new Error("No scripts found");

        return scripts;
    },

    getUserContributions: async (_: any, { _id }: { _id: string }) => {
        // Contributions now come from Paragraphs directly

        const paragraphs = await Paragraph.find({ author: _id })
            .populate("script")
            .lean();

        return paragraphs.map((p) => ({
            _id: p._id,
            status: p.status,
            likes: p.likes || 0,
            dislikes: p.dislikes || 0,
            comments: p.comments || [],
            text: p.text,
            createdAt: p.createdAt,
            scriptId: p.script?._id,
        }));
    },
};
