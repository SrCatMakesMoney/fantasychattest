import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };
global.mongooseCache = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Define la variable MONGODB_URI");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { dbName: "fantasy" });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
