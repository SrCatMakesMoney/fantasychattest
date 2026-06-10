import mongoose, { Schema, Document, Model } from "mongoose";

export type RealmEventType =
  | "coronacion"
  | "plaga"
  | "festin"
  | "batalla"
  | "profecia"
  | "decreto"
  | "guerra";

export interface IRealmEvent extends Document {
  type: RealmEventType;
  title: string;
  description: string;
  involvedUsers: mongoose.Types.ObjectId[];
  factions: mongoose.Types.ObjectId[];
  post: mongoose.Types.ObjectId | null;
  createdAt: Date;
}

const RealmEventSchema = new Schema<IRealmEvent>(
  {
    type: {
      type: String,
      enum: [
        "coronacion",
        "plaga",
        "festin",
        "batalla",
        "profecia",
        "decreto",
        "guerra",
      ],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    involvedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    factions: [{ type: Schema.Types.ObjectId, ref: "Faction" }],
    post: { type: Schema.Types.ObjectId, ref: "Post", default: null },
  },
  { timestamps: true }
);

RealmEventSchema.index({ createdAt: -1 });

export const RealmEvent: Model<IRealmEvent> =
  mongoose.models.RealmEvent ||
  mongoose.model<IRealmEvent>("RealmEvent", RealmEventSchema);
