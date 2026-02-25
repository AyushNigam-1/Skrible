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
            favourites: user.favourites || [],
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

    getUserContributions: async (_: any, { userId }: { userId: string }) => {
        const paragraphs = await Paragraph.find({ author: userId })
            .populate("script")
            .populate("comments.author")
            .sort({ createdAt: -1 })

        return paragraphs.map((p) => ({
            id: p._id,
            status: p.status,
            text: p.text,
            likes: p.likes || 0,
            dislikes: p.dislikes || 0,
            createdAt: p.createdAt.toString(),
            comments: p.comments || [],
            script: p.script,   // IMPORTANT
        }));
    },
    getUserFavourites: async (_: unknown, { userId }: { userId: string }) => {
        const user = await User.findById(userId).populate({
            path: "favourites", // Populates the scripts the user bookmarked
            populate: {
                path: "author", // Deep populates the author of each bookmarked script
                select: "username"
            }
        });

        if (!user) throw new Error("User not found");
        return user.favourites || [];
    },
};
