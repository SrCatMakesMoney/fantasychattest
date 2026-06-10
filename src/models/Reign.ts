import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReign extends Document {
  king: mongoose.Types.ObjectId;
  weekKey: string;
  crownedAt: Date;
  createdAt: Date;
}

const ReignSchema = new Schema<IReign>(
  {
    king: { type: Schema.Types.ObjectId, ref: "User", required: true },
    weekKey: { type: String, required: true, unique: true },
    crownedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Reign: Model<IReign> =
  mongoose.models.Reign || mongoose.model<IReign>("Reign", ReignSchema);
