import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  username: string;
  displayName: string;
  password: string;
  avatar: string;
  banner: string;
  bio: string;
  realm: string;
  badges: string[];
  faction: mongoose.Types.ObjectId | null;
  oroGastado: number;
  cosmeticosDesbloqueados: string[];
  cosmeticos: {
    marco: string;
    titulo: string;
    colorNombre: string;
  };
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, lowercase: true },
    displayName: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" },
    banner: { type: String, default: "" },
    bio: { type: String, default: "Un viajero de los reinos oscuros..." },
    realm: { type: String, default: "Fortaleza de Sombras" },
    badges: { type: [String], default: [] },
    faction: { type: Schema.Types.ObjectId, ref: "Faction", default: null },
    oroGastado: { type: Number, default: 0 },
    cosmeticosDesbloqueados: { type: [String], default: [] },
    cosmeticos: {
      marco: { type: String, default: "" },
      titulo: { type: String, default: "" },
      colorNombre: { type: String, default: "" },
    },
  },
  { timestamps: true, autoIndex: true }
);

async function ensureCleanIndexes() {
  try {
    const collection = mongoose.connection.collection("users");
    const indexes = await collection.indexes();
    for (const idx of indexes) {
      if (idx.key && "email" in idx.key) {
        await collection.dropIndex(idx.name!);
      }
    }
  } catch {
    // ignore if collection doesn't exist yet
  }
}

let modelInitialized = false;

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

if (!modelInitialized) {
  modelInitialized = true;
  mongoose.connection.once("connected", () => {
    ensureCleanIndexes();
  });
}
