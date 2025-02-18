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
    createRequest: async (_: any, { scriptId, text }: any, context: { user: { id: string } }) => {
        if (!context.user) {
            throw new Error("Unauthorized");
        }

        const author = new mongoose.Types.ObjectId(context.user.id);

        const script = await Script.findById(scriptId);
        if (!script) {
            throw new Error("Script not found");
        }

        const newRequest = {
            _id: new mongoose.Types.ObjectId(),
            author,
            status: "pending",  // Default status
            likes: 0,
            dislikes: 0,
            comments: [],
            text,
        };

        script.requests.push(newRequest);
        await script.save();
        await User.findByIdAndUpdate(author, { $push: { contributions: newRequest._id } });
        const populatedRequest = await Script.findById(scriptId)
            .select('requests')
            .populate('requests.author'); // This will populate the author field of the new request

        // Find the newly added request within the populated requests array
        const populatedNewRequest = populatedRequest?.requests.find(request => request._id.toString() === newRequest._id.toString());

        return populatedNewRequest;
    },
    markAsInterested: async (
        _: any,
        { scriptId }: { scriptId: string },
        context: { user: { id: string } }
    ): Promise<{ status: boolean }> => {
        const userId = context.user?.id;
        if (!userId) {
            throw new GraphQLError("User not authenticated");
        }

        const result = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { interested: new mongoose.Types.ObjectId(scriptId) }, $pull: { notInterested: new mongoose.Types.ObjectId(scriptId) } },
            { new: true }
        );

        return { status: !!result };
    },

    markAsNotInterested: async (
        _: any,
        { scriptId }: { scriptId: string },
        context: { user: { id: string } }
    ): Promise<{ status: boolean }> => {
        const userId = context.user?.id;
        if (!userId) {
            throw new GraphQLError("User not authenticated");
        }

        const result = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { notInterested: new mongoose.Types.ObjectId(scriptId) }, $pull: { interested: new mongoose.Types.ObjectId(scriptId) } },
            { new: true }
        );

        return { status: !!result };
    },

    markAsFavourite: async (
        _: any,
        { scriptId }: { scriptId: string },
        context: { user: { id: string } }
    ): Promise<{ status: boolean }> => {
        const userId = context.user?.id;
        if (!userId) {
            throw new GraphQLError("User not authenticated");
        }

        const result = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { favourites: new mongoose.Types.ObjectId(scriptId) } },
            { new: true }
        );

        return { status: !!result };
    },

    deleteScript: async (
        _: any,
        { scriptId }: { scriptId: string },
        context: { user: { id: string } }
    ): Promise<{ status: boolean }> => {
        const userId = context.user?.id;
        if (!userId) {
            throw new GraphQLError("User not authenticated");
        }

        const script = await Script.findById(scriptId);

        if (!script) {
            throw new GraphQLError("Script not found");
        }

        if (script.author.toString() !== userId) {
            throw new GraphQLError(`${script.author.toString()}-${userId}`);
        }

        const deleteResult = await Script.findByIdAndDelete(scriptId);

        if (deleteResult) {
            await User.updateMany(
                {},
                {
                    $pull: {
                        scripts: new mongoose.Types.ObjectId(scriptId),
                        favourites: new mongoose.Types.ObjectId(scriptId),
                        interested: new mongoose.Types.ObjectId(scriptId),
                        notInterested: new mongoose.Types.ObjectId(scriptId),
                    },
                }
            );
        }

        return { status: !!deleteResult };
    },
}
