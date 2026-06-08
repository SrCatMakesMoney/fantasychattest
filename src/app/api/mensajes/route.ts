import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Message } from "@/models/Message";
import { User } from "@/models/User";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = request.nextUrl;
    const otherUserId = searchParams.get("con");

    if (!otherUserId) {
      return Response.json({ error: "Especifica usuario con parametro 'con'" }, { status: 400 });
    }

    const messages = await Message.find({
      $or: [
        { sender: session.userId, receiver: otherUserId },
        { sender: otherUserId, receiver: session.userId },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(100)
      .populate("sender", "username displayName avatar")
      .populate("receiver", "username displayName avatar");

    await Message.updateMany(
      { sender: otherUserId, receiver: session.userId, read: false },
      { read: true }
    );

    return Response.json({ mensajes: messages });
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
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
    const { receiverId, content } = await request.json();

    if (!receiverId || !content) {
      return Response.json(
        { error: "Destinatario y contenido son requeridos" },
        { status: 400 }
      );
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return Response.json({ error: "Destinatario no encontrado" }, { status: 404 });
    }

    const message = await Message.create({
      sender: session.userId,
      receiver: receiverId,
      content: content.trim(),
    });

    const populated = await message.populate([
      { path: "sender", select: "username displayName avatar" },
      { path: "receiver", select: "username displayName avatar" },
    ]);

    return Response.json({ mensaje: populated }, { status: 201 });
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
