import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

declare global {
  // eslint-disable-next-line no-var
  var _mongoPromise: Promise<typeof mongoose> | undefined;
}

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("Define la variable MONGODB_URI");
  }

  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  if (!global._mongoPromise) {
    global._mongoPromise = mongoose.connect(MONGODB_URI, {
      dbName: "fantasy",
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
    });

    mongoose.connection.on("disconnected", () => {
      global._mongoPromise = undefined;
    });

    mongoose.connection.on("error", () => {
      global._mongoPromise = undefined;
    });
  }

  try {
    await global._mongoPromise;
  } catch {
    global._mongoPromise = undefined;
    global._mongoPromise = mongoose.connect(MONGODB_URI, {
      dbName: "fantasy",
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
    });
    await global._mongoPromise;
  }

  return mongoose;
}
