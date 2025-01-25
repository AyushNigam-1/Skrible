import Script from "../../../models/Script";
import { GraphQLError } from "graphql";

export const scriptMutations = {
    createScript: async (
        _: any,
        { title, visibility, language, genre, paragraphs }: {
            title: string;
            visibility: string;
            language: string;
            genre: string[];
            paragraphs: {
                text: string;
            }[];
        },
        context: { user: { id: string } } // Assuming you have user info in the context
    ) => {
        if (!title || !visibility || !language || !genre || !paragraphs) {
            throw new GraphQLError("All required fields must be provided");
        }

        const userId = context.user?.id; // Fetching the user ID from context
        if (!userId) {
            throw new GraphQLError("User not authenticated");
        }

        const enrichedParagraphs = paragraphs.map(paragraph => ({
            ...paragraph,
            createdAt: new Date().toISOString(),
            likes: 0,
            dislikes: 0,
            author: userId,
            comments: [],
        }));

        const newScript = new Script({
            title,
            visibility,
            language,
            genre,
            paragraphs: enrichedParagraphs,
        });

        await newScript.save();

        return {
            id: newScript._id,
            title: newScript.title,
            visibility: newScript.visibility,
            language: newScript.language,
            genre: newScript.genre,
            paragraphs: newScript.paragraphs,
        };
    },
};


