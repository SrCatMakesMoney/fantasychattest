import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFaction extends Document {
  name: string;
  motto: string;
  emblem: string;
  leader: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  lastBattleAt: Date | null;
  createdAt: Date;
}

const FactionSchema = new Schema<IFaction>(
  {
    name: { type: String, required: true, unique: true, maxlength: 40 },
    motto: { type: String, default: "", maxlength: 120 },
    emblem: { type: String, default: "⚑", maxlength: 4 },
    leader: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    lastBattleAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Faction: Model<IFaction> =
  mongoose.models.Faction || mongoose.model<IFaction>("Faction", FactionSchema);
