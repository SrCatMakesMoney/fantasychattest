import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.userId).select("-password");
    if (!user) {
      return Response.json({ error: "Usuario no encontrado" }, { status: 404 });
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
    console.error("Error en sesion:", error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  return Response.json({ success: true });
}
