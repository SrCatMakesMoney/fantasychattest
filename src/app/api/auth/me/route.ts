import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.userId).select("-password");
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        realm: user.realm,
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  return Response.json({ success: true });
}
