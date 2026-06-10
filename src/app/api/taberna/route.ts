import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { TavernMessage } from "@/models/TavernMessage";
import "@/models/User";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    await connectDB();
    const mensajes = await TavernMessage.find()
      .sort({ createdAt: -1 })
      .limit(60)
      .populate({
        path: "author",
        select: "username displayName avatar cosmeticos",
      });

    return Response.json({ mensajes: mensajes.reverse() });
  } catch (error) {
    console.error("Error en la taberna:", error);
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
    const { content } = await request.json();
    if (!content || !content.trim()) {
      return Response.json({ error: "Mensaje vacío" }, { status: 400 });
    }
    if (content.length > 500) {
      return Response.json({ error: "Mensaje muy largo" }, { status: 400 });
    }

    const mensaje = await TavernMessage.create({
      author: session.userId,
      content: content.trim(),
    });

    const populated = await TavernMessage.findById(mensaje._id).populate({
      path: "author",
      select: "username displayName avatar cosmeticos",
    });

    return Response.json({ mensaje: populated }, { status: 201 });
  } catch (error) {
    console.error("Error al hablar en la taberna:", error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
