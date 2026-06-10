import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import "@/models/Faction";
import { Post } from "@/models/Post";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("pagina") || "1");
    const limit = 20;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: "author", select: "username displayName avatar realm badges faction cosmeticos", populate: { path: "faction", select: "name emblem" } });

    return Response.json({ publicaciones: posts });
  } catch (error) {
    console.error("Error al obtener publicaciones:", error);
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
    const { content, mediaUrl, mediaType } = await request.json();

    if (!content || content.trim().length === 0) {
      return Response.json({ error: "El contenido es requerido" }, { status: 400 });
    }

    if (content.length > 500) {
      return Response.json(
        { error: "Muy largo (max 500 caracteres)" },
        { status: 400 }
      );
    }

    const post = await Post.create({
      author: session.userId,
      content: content.trim(),
      mediaUrl: mediaUrl || "",
      mediaType: mediaType || "",
    });

    let populated;
    try {
      populated = await Post.findById(post._id).populate({ path: "author", select: "username displayName avatar realm badges faction cosmeticos", populate: { path: "faction", select: "name emblem" } });
    } catch {
      populated = post;
    }

    return Response.json({ publicacion: populated || post }, { status: 201 });
  } catch (error) {
    console.error("Error al crear publicacion:", error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
