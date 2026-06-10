import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  content: string;
  mediaUrl: string;
  mediaType: "image" | "video" | "audio" | "";
  likes: mongoose.Types.ObjectId[];
  eventType: "" | "evento" | "decreto" | "coronacion";
  createdAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 500 },
    mediaUrl: { type: String, default: "" },
    mediaType: { type: String, enum: ["image", "video", "audio", ""], default: "" },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    eventType: {
      type: String,
      enum: ["", "evento", "decreto", "coronacion"],
      default: "",
    },
  },
  { timestamps: true }
);

export const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);
