import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import "@/models/Faction";
import { User } from "@/models/User";
import { Post } from "@/models/Post";
import { Comment } from "@/models/Comment";
import { getSession } from "@/lib/auth";
import { computeXp } from "@/lib/nivel";

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
      .populate({ path: "author", select: "username displayName avatar realm badges faction", populate: { path: "faction", select: "name emblem" } });

    const postCount = await Post.countDocuments({ author: userId });

    const [likeStats, commentCount] = await Promise.all([
      Post.aggregate([
        { $match: { author: user._id } },
        {
          $group: {
            _id: null,
            likes: { $sum: { $size: { $ifNull: ["$likes", []] } } },
          },
        },
      ]),
      Comment.countDocuments({ author: userId }),
    ]);
    const likesReceived = likeStats[0]?.likes || 0;
    const stats = {
      posts: postCount,
      likesReceived,
      comments: commentCount,
      badges: (user.badges || []).length,
    };

    return Response.json({
      usuario: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        banner: user.banner,
        bio: user.bio,
        realm: user.realm,
        badges: user.badges || [],
        createdAt: user.createdAt,
      },
      publicaciones: posts,
      totalPublicaciones: postCount,
      stats,
      xp: computeXp(stats),
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
