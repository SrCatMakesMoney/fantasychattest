import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  username: string;
  displayName: string;
  password: string;
  avatar: string;
  bio: string;
  realm: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, lowercase: true },
    displayName: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "/avatars/default.png" },
    bio: { type: String, default: "A wanderer of the dark realms..." },
    realm: { type: String, default: "Shadow Keep" },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
