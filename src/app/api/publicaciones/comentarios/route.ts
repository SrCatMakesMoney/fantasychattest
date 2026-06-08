import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Comment } from "@/models/Comment";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const postId = searchParams.get("postId");

    if (!postId) {
      return Response.json({ error: "postId requerido" }, { status: 400 });
    }

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: 1 })
      .limit(50)
      .populate("author", "username displayName avatar realm");

    return Response.json({ comentarios: comments });
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    await connectDB();
    const { postId, content } = await request.json();

    if (!postId || !content || content.trim().length === 0) {
      return Response.json({ error: "postId y contenido requeridos" }, { status: 400 });
    }

    if (content.length > 300) {
      return Response.json({ error: "Muy largo (max 300 caracteres)" }, { status: 400 });
    }

    const comment = await Comment.create({
      post: postId,
      author: session.userId,
      content: content.trim(),
    });

    let populated;
    try {
      populated = await Comment.findById(comment._id).populate(
        "author",
        "username displayName avatar realm"
      );
    } catch {
      populated = comment;
    }

    return Response.json({ comentario: populated || comment }, { status: 201 });
  } catch (error) {
    console.error("Error al crear comentario:", error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
