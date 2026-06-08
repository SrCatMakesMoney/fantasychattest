import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "username displayName avatar realm");

    return Response.json({ posts });
  } catch (error) {
    console.error("Get posts error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return Response.json({ error: "Content is required" }, { status: 400 });
    }

    if (content.length > 500) {
      return Response.json(
        { error: "Content too long (max 500 chars)" },
        { status: 400 }
      );
    }

    const post = await Post.create({
      author: session.userId,
      content: content.trim(),
    });

    const populated = await post.populate("author", "username displayName avatar realm");

    return Response.json({ post: populated }, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
