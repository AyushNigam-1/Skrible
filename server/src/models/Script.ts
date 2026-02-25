import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IScript extends Document {
    author: Types.ObjectId;
    title: string;
    visibility: string;
    languages: string[];
    description: string;
    genres: string[];
    paragraphs: Types.ObjectId[];

    // NEW: Added likes and dislikes arrays to the interface
    likes: Types.ObjectId[];
    dislikes: Types.ObjectId[];

    combinedText?: string;
    createdAt: Date;
    updatedAt: Date;
}

const scriptSchema = new Schema(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: true,
        },

        visibility: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        languages: {
            type: [String],
            required: true,
        },

        genres: {
            type: [String],
            required: true,
        },

        paragraphs: [
            {
                type: Schema.Types.ObjectId,
                ref: "Paragraph",
            },
        ],

        // NEW: Stores an array of User IDs who liked the script
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            }
        ],

        // NEW: Stores an array of User IDs who disliked the script
        dislikes: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            }
        ],

        combinedText: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

/* ✅ GraphQL needs id, Mongo gives _id — add virtual */

scriptSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

/* ✅ Make virtuals appear in JSON */

scriptSchema.set("toJSON", {
    virtuals: true,
});

scriptSchema.set("toObject", {
    virtuals: true,
});

const Script: Model<IScript> = mongoose.model<IScript>("Script", scriptSchema);

export default Script;