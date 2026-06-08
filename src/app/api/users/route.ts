import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
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
    const search = searchParams.get("search") || "";

    const query = search
      ? {
          $or: [
            { username: { $regex: search, $options: "i" } },
            { displayName: { $regex: search, $options: "i" } },
          ],
          _id: { $ne: session.userId },
        }
      : { _id: { $ne: session.userId } };

    const users = await User.find(query)
      .select("-password")
      .limit(20)
      .sort({ createdAt: -1 });

    return Response.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
