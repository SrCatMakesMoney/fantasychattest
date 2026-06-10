import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { ensureReign, getWeekKey } from "@/lib/reino";
import { Reign } from "@/models/Reign";
import { Post } from "@/models/Post";
import { RealmEvent } from "@/models/RealmEvent";
import { User } from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    await connectDB();
    await ensureReign();

    const reign = await Reign.findOne({ weekKey: getWeekKey() });
    if (!reign || String(reign.king) !== session.userId) {
      return Response.json(
        { error: "Solo el rey puede emitir decretos" },
        { status: 403 }
      );
    }

    const { content } = await request.json();
    if (!content || content.trim().length === 0) {
      return Response.json({ error: "El decreto no puede estar vacío" }, { status: 400 });
    }
    if (content.length > 500) {
      return Response.json({ error: "Muy largo (max 500 caracteres)" }, { status: 400 });
    }

    const king = await User.findById(session.userId).select("displayName");
    const post = await Post.create({
      author: session.userId,
      content: content.trim(),
      eventType: "decreto",
    });
    await RealmEvent.create({
      type: "decreto",
      title: `Decreto real de ${king?.displayName || "el rey"}`,
      description: content.trim(),
      involvedUsers: [session.userId],
      post: post._id,
    });

    return Response.json({ publicacion: post }, { status: 201 });
  } catch (error) {
    console.error("Error al emitir decreto:", error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
