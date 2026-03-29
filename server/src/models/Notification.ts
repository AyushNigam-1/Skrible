import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface INotification extends Document {
    recipient: Types.ObjectId;
    sender?: Types.ObjectId;
    type: "LIKE" | "COMMENT" | "REQUEST" | "INFO";
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema(
    {
        recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
        sender: { type: Schema.Types.ObjectId, ref: "User" },
        type: { type: String, enum: ["LIKE", "COMMENT", "REQUEST", "SYSTEM"], required: true },
        message: { type: String, required: true },
        link: { type: String },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

notificationSchema.virtual("id").get(function () {
    return this._id.toHexString();
});
notificationSchema.set("toJSON", { virtuals: true });
notificationSchema.set("toObject", { virtuals: true });

const Notification: Model<INotification> = mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;