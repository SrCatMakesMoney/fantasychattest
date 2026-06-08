import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Post } from "@/models/Post";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("id");

    if (!userId) {
      return Response.json({ error: "id requerido" }, { status: 400 });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return Response.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("author", "username displayName avatar realm");

    const postCount = await Post.countDocuments({ author: userId });

    return Response.json({
      usuario: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        banner: user.banner,
        bio: user.bio,
        realm: user.realm,
        createdAt: user.createdAt,
      },
      publicaciones: posts,
      totalPublicaciones: postCount,
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
