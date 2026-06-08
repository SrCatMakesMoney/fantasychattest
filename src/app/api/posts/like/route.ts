import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();
    const { postId } = await request.json();

    if (!postId) {
      return Response.json({ error: "Post ID is required" }, { status: 400 });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    const userIdStr = session.userId;
    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userIdStr
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userIdStr);
    } else {
      post.likes.push(session.userId as unknown as import("mongoose").Types.ObjectId);
    }

    await post.save();
    return Response.json({ likes: post.likes.length, liked: !alreadyLiked });
  } catch (error) {
    console.error("Like error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
