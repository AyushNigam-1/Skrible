import mongoose, { Schema, Document, Types } from 'mongoose';

interface IUser extends Document {
    username: string;
    languages: string[];
    location: string;
    password: string;
    bio: string;
    email: string;
    scripts: Types.ObjectId[];
    likes: Types.ObjectId[];
    follows: Types.ObjectId[];
    views: number;
    followers: Types.ObjectId[];
    favourites: Types.ObjectId[];  // Script IDs marked as favourites
    interested: Types.ObjectId[];  // Script IDs marked as interested
    notInterested: Types.ObjectId[];
    contributions: Types.ObjectId[]
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true },
    languages: { type: [String] },
    location: { type: String },
    bio: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    scripts: { type: [Schema.Types.ObjectId], ref: 'Script', default: [] },
    likes: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    follows: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    views: { type: Number, default: 0 },
    followers: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    favourites: { type: [Schema.Types.ObjectId], ref: 'Script', default: [] },
    interested: { type: [Schema.Types.ObjectId], ref: 'Script', default: [] },
    notInterested: { type: [Schema.Types.ObjectId], ref: 'Script', default: [] },
    contributions: { type: [Schema.Types.ObjectId], ref: 'Request', default: [] } // Added field

}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
