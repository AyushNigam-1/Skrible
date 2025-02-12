import mongoose from "mongoose";
import Script from "../../../models/Script";
import User from "../../../models/User";
import { GraphQLError } from "graphql";

export const scriptMutations = {
    createScript: async (
        _: any,
        { title, visibility, description, languages, genres, paragraph }: {
            title: string;
            visibility: string;
            languages: string[];
            genres: string[];
            description: string;
            paragraph: string;
        },
        context: { user: { id: string } }
    ) => {
        if (!title || !visibility || !languages || !genres || !description || !paragraph) {
            throw new GraphQLError("All required fields must be provided");
        }

        const userId = context.user?.id;
        if (!userId) {
            throw new GraphQLError("User not authenticated");
        }

        const initialRequest = {
            status: "completed",
            author: new mongoose.Types.ObjectId(userId),
            likes: 0,
            dislikes: 0,
            comments: [],
            text: paragraph,
        };

        const enrichedParagraph = {
            text: paragraph,
            likes: 0,
            dislikes: 0,
            author: new mongoose.Types.ObjectId(userId),
            comments: [],
        };

        const newScript = new Script({
            author: new mongoose.Types.ObjectId(userId),
            title,
            visibility,
            languages,
            genres,
            description,
            paragraphs: [enrichedParagraph],
            requests: [initialRequest],
        });

        const script = await newScript.save();

        await User.findByIdAndUpdate(userId, {
            $push: { scripts: script._id }
        });

        const populatedScript = await Script.findById(script._id)
            .populate("author")
            .populate("paragraphs.author").populate('requests.author');

        return populatedScript;
    },
};
