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
};
