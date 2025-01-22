import mongoose, { Schema, Document, Model } from "mongoose";

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    createdAt: {
        type: String,
        required: true,
    },
});

const paragraphSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    createdAt: {
        type: String,
        required: true,
    },
    author: {
        type: String,
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
});


const scriptSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    visibility: {
        type: String,
        required: true,
        enum: ["public", "private"],
    },
    language: {
        type: String,
        required: true,
    },
    genre: {
        type: [String],
        required: true,
    },
    paragraphs: {
        type: [paragraphSchema],
        required: true,
    },
});

export interface IScript extends Document {
    title: string;
    visibility: string;
    language: string;
    genre: string[];
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
}

const Script: Model<IScript> = mongoose.model<IScript>("Script", scriptSchema);

export default Script;
