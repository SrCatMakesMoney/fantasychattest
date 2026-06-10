import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITavernMessage extends Document {
  author: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const TavernMessageSchema = new Schema<ITavernMessage>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

TavernMessageSchema.index({ createdAt: -1 });

export const TavernMessage: Model<ITavernMessage> =
  mongoose.models.TavernMessage ||
  mongoose.model<ITavernMessage>("TavernMessage", TavernMessageSchema);
