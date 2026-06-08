import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { username, password } = await request.json();

    if (!username || !password) {
      return Response.json(
        { error: "Usuario y contrasena son requeridos" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return Response.json({ error: "Credenciales invalidas" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return Response.json({ error: "Credenciales invalidas" }, { status: 401 });
    }

    const token = signToken({ userId: user._id.toString(), username: user.username });
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

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
    console.error("Error al iniciar sesion:", error);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
