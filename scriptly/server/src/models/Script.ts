import mongoose, { Document, Model, Schema, Types } from "mongoose";

const commentSchema = new mongoose.Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const requestSchema = new mongoose.Schema(
    {
        _id: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
        likes: {
            type: Number,
            required: true,
            default: 0,
        },
        dislikes: {
            type: Number,
            required: true,
            default: 0,
        },
        comments: {
            type: [commentSchema],
            required: true,
            default: [],
        },
        text: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const paragraphSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    likes: {
        type: Number,
        required: true,
    },
    dislikes: {
        type: Number,
        required: true,
    },
    comments: {
        type: [commentSchema],
        required: true,
    },
}, { timestamps: true });

const scriptSchema = new mongoose.Schema({
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
    paragraphs: {
        type: [paragraphSchema],
        required: true,
    },
    requests: {
        type: [requestSchema],
        required: true,
    },
    combinedText: {
        type: String,
        default: "",
    }
}, { timestamps: true });

export interface IScript extends Document {
    author: Types.ObjectId;
    title: string;
    visibility: string;
    languages: string[];
    description: string;
    genres: string[];
    paragraphs: {
        text: string;
        createdAt: string;
        author: string;
        likes: number;
        dislikes: number;
        comments: {
            text: string;
            createdAt: string;
        }[];
    }[];
    requests: {
        _id: Types.ObjectId;
        author: Types.ObjectId;
        status: string;
        likes: number;
        dislikes: number;
        comments: {
            text: string;
            createdAt: string;
        }[];
        text: string;
    }[];
    combinedText: string;
}

const Script: Model<IScript> = mongoose.model<IScript>("Script", scriptSchema);

export default Script;