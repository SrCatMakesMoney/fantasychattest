import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Message } from "@/models/Message";
import { User } from "@/models/User";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = request.nextUrl;
    const otherUserId = searchParams.get("with");

    if (!otherUserId) {
      return Response.json({ error: "Specify user with 'with' param" }, { status: 400 });
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

    return Response.json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
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
    const { receiverId, content } = await request.json();

    if (!receiverId || !content) {
      return Response.json(
        { error: "Receiver and content are required" },
        { status: 400 }
      );
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return Response.json({ error: "Receiver not found" }, { status: 404 });
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

    return Response.json({ message: populated }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
