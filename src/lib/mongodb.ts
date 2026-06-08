import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };
global.mongooseCache = cached;

export async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Define la variable MONGODB_URI");
  }

  if (!cached.promise || mongoose.connection.readyState === 0) {
    cached.promise = mongoose.connect(uri, { dbName: "fantasy" });
  }

  try {
    cached.conn = await cached.promise;
  } catch {
    cached.promise = null;
    cached.conn = null;
    cached.promise = mongoose.connect(uri, { dbName: "fantasy" });
    cached.conn = await cached.promise;
  }

  return cached.conn;
}
