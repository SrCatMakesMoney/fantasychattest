import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFactionMessage extends Document {
  faction: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  mediaUrl: string;
  mediaType: "image" | "video" | "audio" | "";
  createdAt: Date;
}

const FactionMessageSchema = new Schema<IFactionMessage>(
  {
    faction: { type: Schema.Types.ObjectId, ref: "Faction", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, default: "", maxlength: 500 },
    mediaUrl: { type: String, default: "" },
    mediaType: {
      type: String,
      enum: ["image", "video", "audio", ""],
      default: "",
    },
  },
  { timestamps: true }
);

FactionMessageSchema.index({ faction: 1, createdAt: -1 });

export const FactionMessage: Model<IFactionMessage> =
  mongoose.models.FactionMessage ||
  mongoose.model<IFactionMessage>("FactionMessage", FactionMessageSchema);
