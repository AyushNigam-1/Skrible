import mongoose, { Schema, Document, Types } from "mongoose";
import mongooseFieldEncryption from "mongoose-field-encryption";
import dotenv from "dotenv";

dotenv.config();

interface IUser extends Document {
  username: string;
  languages: string[];
  location: string;
  password: string;
  bio: string;
  email: string;
  scripts: Types.ObjectId[];
  likes: Types.ObjectId[];
  follows: number;
  views: Types.ObjectId[];
  followers: Types.ObjectId[];
  favourites: Types.ObjectId[]; // Script IDs marked as favourites
  interested: Types.ObjectId[]; // Script IDs marked as interested
  notInterested: Types.ObjectId[];
  contributions: Types.ObjectId[];
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true },
    languages: { type: [String] },
    location: { type: String },
    bio: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    scripts: { type: [Schema.Types.ObjectId], ref: "Script", default: [] },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    views: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikes: { type: Number, default: 0 },
    follows: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    followers: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    favourites: { type: [Schema.Types.ObjectId], ref: "Script", default: [] },
    interested: { type: [Schema.Types.ObjectId], ref: "Script", default: [] },
    notInterested: {
      type: [Schema.Types.ObjectId],
      ref: "Script",
      default: [],
    },
    contributions: {
      type: [Schema.Types.ObjectId],
      ref: "Request",
      default: [],
    },
  },
  { timestamps: true },
);
UserSchema.plugin(mongooseFieldEncryption.fieldEncryption, {
  fields: ["email"],
  secret: process.env.FIELD_ENCRYPTION_KEY,
});
export default mongoose.model<IUser>("User", UserSchema);
