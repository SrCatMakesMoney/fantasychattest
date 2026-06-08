import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  content: string;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 500 },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);
