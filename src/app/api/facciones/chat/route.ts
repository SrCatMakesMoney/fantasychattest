import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { FactionMessage } from "@/models/FactionMessage";
import { User } from "@/models/User";

async function getMyFaction(userId: string) {
  const me = await User.findById(userId).select("faction");
  return me?.faction || null;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    await connectDB();
    const factionId = await getMyFaction(session.userId);
    if (!factionId) {
      return Response.json(
        { error: "No perteneces a ninguna facción" },
        { status: 403 }
      );
    }

    const mensajes = await FactionMessage.find({ faction: factionId })
      .sort({ createdAt: -1 })
      .limit(60)
      .populate({
        path: "author",
        select: "username displayName avatar cosmeticos",
      });

    return Response.json({ mensajes: mensajes.reverse() });
  } catch (error) {
    console.error("Error en el chat de facción:", error);
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
    const factionId = await getMyFaction(session.userId);
    if (!factionId) {
      return Response.json(
        { error: "No perteneces a ninguna facción" },
        { status: 403 }
      );
    }

    const { content, mediaUrl, mediaType } = await request.json();
    const texto = (content || "").trim();
    if (!texto && !mediaUrl) {
      return Response.json({ error: "Mensaje vacío" }, { status: 400 });
    }
    if (texto.length > 500) {
      return Response.json({ error: "Mensaje muy largo" }, { status: 400 });
    }

    const mensaje = await FactionMessage.create({
      faction: factionId,
      author: session.userId,
      content: texto,
      mediaUrl: mediaUrl || "",
      mediaType: mediaType || "",
    });

    const populated = await FactionMessage.findById(mensaje._id).populate({
      path: "author",
      select: "username displayName avatar cosmeticos",
    });

    return Response.json({ mensaje: populated }, { status: 201 });
  } catch (error) {
    console.error("Error al hablar en la facción:", error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
