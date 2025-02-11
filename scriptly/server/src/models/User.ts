import mongoose, { Schema, Document, Types } from 'mongoose';

interface IUser extends Document {
    username: string;
    languages: string[];
    location: string;
    password: string;
    bio: string;
    email: string;
    interests: string[];
    scripts: Types.ObjectId[];
    likes: Types.ObjectId[];
    follows: Types.ObjectId[];
    views: number;
    followers: number;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true },
    languages: { type: [String] },
    location: { type: String },
    bio: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    interests: { type: [String], default: [] },
    scripts: { type: [Schema.Types.ObjectId], ref: 'Script', default: [] },
    likes: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    follows: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    views: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    followers: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
