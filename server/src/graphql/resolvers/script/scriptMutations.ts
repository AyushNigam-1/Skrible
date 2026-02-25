import mongoose from "mongoose";
import Script from "../../../models/Script";
import Paragraph from "../../../models/Paragraph";
import User from "../../../models/User";
import { GraphQLError } from "graphql";

export const scriptMutations = {
    createScript: async (
        _: any,
        {
            title,
            visibility,
            description,
            languages,
            genres,
        }: {
            title: string;
            visibility: string;
            languages: string[];
            genres: string[];
            description: string;
        },
        context: { user: { id: string } }
    ) => {
        if (!context.user?.id) {
            throw new GraphQLError("User not authenticated");
        }

        const script = await Script.create({
            author: new mongoose.Types.ObjectId(context.user.id),
            title,
            visibility,
            description,
            languages,
            genres,
            paragraphs: [],
            requests: [],
            combinedText: ""
        });

        await User.findByIdAndUpdate(context.user.id, {
            $push: { scripts: script._id }
        });

        return Script.findById(script._id).populate("author");
    },

    submitParagraph: async (
        _: any,
        { scriptId, text }: { scriptId: string; text: string },
        context: { user: { id: string } }
    ) => {
        const userId = context.user?.id;
        if (!userId) throw new GraphQLError("User not authenticated");

        const paragraph = await Paragraph.create({
            script: scriptId,
            author: userId,
            text,
            status: "pending",
        });

        return paragraph.populate("author");
    },

    approveParagraph: async (_: any, { paragraphId }: { paragraphId: string }) => {
        const paragraph = await Paragraph.findByIdAndUpdate(
            paragraphId,
            { status: "approved" },
            { new: true }
        );

        if (!paragraph) throw new GraphQLError("Paragraph not found");

        await Script.findByIdAndUpdate(paragraph.script, {
            $addToSet: { paragraphs: paragraph._id },
        });

        return { status: true };
    },

    rejectParagraph: async (_: any, { paragraphId }: { paragraphId: string }) => {
        await Paragraph.findByIdAndUpdate(paragraphId, { status: "rejected" });
        return { status: true };
    },

    markAsInterested: async (_: any, { scriptId }: { scriptId: string }, context: any) => {
        const userId = context.user?.id;
        if (!userId) throw new GraphQLError("Auth required");

        await User.findByIdAndUpdate(userId, {
            $addToSet: { interested: scriptId },
            $pull: { notInterested: scriptId },
        });

        return { status: true };
    },

    markAsNotInterested: async (_: any, { scriptId }: { scriptId: string }, context: any) => {
        const userId = context.user?.id;
        if (!userId) throw new GraphQLError("Auth required");

        await User.findByIdAndUpdate(userId, {
            $addToSet: { notInterested: scriptId },
            $pull: { interested: scriptId },
        });

        return { status: true };
    },

    markAsFavourite: async (_: any, { scriptId }: { scriptId: string }, context: any) => {
        const userId = context.user?.id;
        if (!userId) throw new GraphQLError("Auth required");

        await User.findByIdAndUpdate(userId, {
            $addToSet: { favourites: scriptId },
        });

        return { status: true };
    },

    deleteScript: async (_: any, { scriptId }: { scriptId: string }, context: any) => {
        const userId = context.user?.id;
        if (!userId) throw new GraphQLError("Auth required");

        await Script.findByIdAndDelete(scriptId);
        await Paragraph.deleteMany({ script: scriptId });

        return { status: true };
    },
    updateScript: async (
        _: any,
        {
            scriptId,
            title,
            description,
            visibility
        }: {
            scriptId: string;
            title?: string;
            description?: string;
            visibility?: string;
        },
        context: any
    ) => {
        const userId = context.user?.id;
        if (!userId) throw new GraphQLError("User not authenticated");

        const script = await Script.findById(scriptId);
        if (!script) throw new GraphQLError("Script not found");

        // SECURITY: Check if the logged-in user is the author
        if (script.author.toString() !== userId) {
            throw new GraphQLError("Not authorized to update this script");
        }

        // Apply updates
        if (title !== undefined) script.title = title;
        if (description !== undefined) script.description = description;
        if (visibility !== undefined) script.visibility = visibility;

        await script.save();
        return script.populate("author");
    },
    // --- PARAGRAPH INTERACTIONS ---
    likeParagraph: async (_: any, { paragraphId }: { paragraphId: string }, context: any) => {
        const userId = context.user?.id;
        if (!userId) throw new GraphQLError("User not authenticated");

        const paragraph = await Paragraph.findById(paragraphId);
        if (!paragraph) throw new GraphQLError("Paragraph not found");

        const hasLiked = paragraph.likes?.includes(userId) || false;

        if (hasLiked) {
            await Paragraph.findByIdAndUpdate(paragraphId, {
                $pull: { likes: userId }
            });
        } else {
            await Paragraph.findByIdAndUpdate(paragraphId, {
                $addToSet: { likes: userId },
                $pull: { dislikes: userId }
            });
        }

        return { status: true };
    },

    dislikeParagraph: async (_: any, { paragraphId }: { paragraphId: string }, context: any) => {
        const userId = context.user?.id;
        if (!userId) throw new GraphQLError("User not authenticated");

        const paragraph = await Paragraph.findById(paragraphId);
        if (!paragraph) throw new GraphQLError("Paragraph not found");

        const hasDisliked = paragraph.dislikes?.includes(userId) || false;

        if (hasDisliked) {
            await Paragraph.findByIdAndUpdate(paragraphId, {
                $pull: { dislikes: userId }
            });
        } else {
            await Paragraph.findByIdAndUpdate(paragraphId, {
                $addToSet: { dislikes: userId },
                $pull: { likes: userId }
            });
        }

        return { status: true };
    },

    addComment: async (_: any, { paragraphId, text }: { paragraphId: string, text: string }, context: any) => {
        const userId = context.user?.id;
        if (!userId) throw new GraphQLError("User not authenticated");

        if (!text || text.trim() === "") {
            throw new GraphQLError("Comment cannot be empty");
        }

        const updatedParagraph = await Paragraph.findByIdAndUpdate(
            paragraphId,
            {
                $push: {
                    comments: {
                        author: userId,
                        text: text
                    }
                }
            },
            { new: true }
        ).populate("comments.author");

        if (!updatedParagraph) throw new GraphQLError("Paragraph not found");

        return updatedParagraph;
    },

    // --- NEW: SCRIPT (DRAFT) INTERACTIONS ---
    likeScript: async (_: any, { scriptId }: { scriptId: string }, context: any) => {
        const userId = context.user?.id;
        if (!userId) throw new GraphQLError("User not authenticated");

        const script = await Script.findById(scriptId);
        if (!script) throw new GraphQLError("Script not found");

        const hasLiked = script.likes?.includes(userId) || false;

        if (hasLiked) {
            // Toggle OFF
            await Script.findByIdAndUpdate(scriptId, {
                $pull: { likes: userId }
            });
        } else {
            // Toggle ON
            await Script.findByIdAndUpdate(scriptId, {
                $addToSet: { likes: userId },
                $pull: { dislikes: userId }
            });
        }

        return { status: true };
    },

    dislikeScript: async (_: any, { scriptId }: { scriptId: string }, context: any) => {
        const userId = context.user?.id;
        if (!userId) throw new GraphQLError("User not authenticated");

        const script = await Script.findById(scriptId);
        if (!script) throw new GraphQLError("Script not found");

        const hasDisliked = script.dislikes?.includes(userId) || false;

        if (hasDisliked) {
            // Toggle OFF
            await Script.findByIdAndUpdate(scriptId, {
                $pull: { dislikes: userId }
            });
        } else {
            // Toggle ON
            await Script.findByIdAndUpdate(scriptId, {
                $addToSet: { dislikes: userId },
                $pull: { likes: userId }
            });
        }

        return { status: true };
    }
};