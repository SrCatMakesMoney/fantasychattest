import { connectDB } from "@/lib/mongodb";
import { Message } from "@/models/Message";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    await connectDB();

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: session.userId },
            { receiver: session.userId },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", session.userId] },
              "$receiver",
              "$sender",
            ],
          },
          lastMessage: { $first: "$content" },
          lastMessageAt: { $first: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", session.userId] },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastMessageAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          lastMessageAt: 1,
          unreadCount: 1,
          "user.username": 1,
          "user.displayName": 1,
          "user.avatar": 1,
          "user.realm": 1,
        },
      },
    ]);

    return Response.json({ conversaciones: conversations });
  } catch (error) {
    console.error("Error en conversaciones:", error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
