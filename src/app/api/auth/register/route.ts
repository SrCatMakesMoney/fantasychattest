import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { username, displayName, password } = await request.json();

    if (!username || !password || !displayName) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      return Response.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username.toLowerCase(),
      displayName,
      password: hashed,
    });

    const token = signToken({ userId: user._id.toString(), username: user.username });
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return Response.json({
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        realm: user.realm,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
