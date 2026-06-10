import { NextRequest } from "next/server";
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
        banner: user.banner,
        bio: user.bio,
        realm: user.realm,
        badges: user.badges || [],
      },
    });
  } catch (error) {
    console.error("Error en sesion:", error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { displayName, bio, realm, avatar, banner } = body;

    const updates: Record<string, string> = {};
    if (displayName !== undefined && displayName.trim().length > 0) {
      updates.displayName = displayName.trim().slice(0, 50);
    }
    if (bio !== undefined) {
      updates.bio = bio.trim().slice(0, 200);
    }
    if (realm !== undefined && realm.trim().length > 0) {
      updates.realm = realm.trim().slice(0, 50);
    }
    if (avatar !== undefined) {
      updates.avatar = avatar.trim();
    }
    if (banner !== undefined) {
      updates.banner = banner.trim();
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "Nada que actualizar" }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(session.userId, updates, {
      new: true,
    }).select("-password");

    if (!user) {
      return Response.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return Response.json({
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        banner: user.banner,
        bio: user.bio,
        realm: user.realm,
        badges: user.badges || [],
      },
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  return Response.json({ success: true });
}
