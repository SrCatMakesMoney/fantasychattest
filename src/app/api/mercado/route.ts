import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { User } from "@/models/User";
import { CATALOGO, getCosmetic } from "@/lib/mercado";
import { computeOro } from "@/lib/oro";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    await connectDB();
    const me = await User.findById(session.userId);
    if (!me) {
      return Response.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const oro = await computeOro(me);

    return Response.json({
      catalogo: CATALOGO,
      oro,
      desbloqueados: me.cosmeticosDesbloqueados || [],
      equipados: me.cosmeticos || { marco: "", titulo: "", colorNombre: "" },
    });
  } catch (error) {
    console.error("Error en el mercado:", error);
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
    const me = await User.findById(session.userId);
    if (!me) {
      return Response.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const { itemId } = await request.json();
    const item = getCosmetic(itemId);
    if (!item) {
      return Response.json({ error: "Objeto no encontrado" }, { status: 404 });
    }
    if ((me.cosmeticosDesbloqueados || []).includes(item.id)) {
      return Response.json({ error: "Ya posees este objeto" }, { status: 400 });
    }

    const oro = await computeOro(me);
    if (oro < item.precio) {
      return Response.json(
        { error: "No tienes suficiente oro... vuelve cuando seas más rico" },
        { status: 400 }
      );
    }

    me.oroGastado = (me.oroGastado || 0) + item.precio;
    me.cosmeticosDesbloqueados = [
      ...(me.cosmeticosDesbloqueados || []),
      item.id,
    ];
    await me.save();

    return Response.json({ success: true, oro: oro - item.precio });
  } catch (error) {
    console.error("Error al comprar:", error);
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
    const me = await User.findById(session.userId);
    if (!me) {
      return Response.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const { itemId, desequipar } = await request.json();

    if (desequipar) {
      const tipo = desequipar as "marco" | "titulo" | "color";
      if (tipo === "marco") me.cosmeticos.marco = "";
      else if (tipo === "titulo") me.cosmeticos.titulo = "";
      else if (tipo === "color") me.cosmeticos.colorNombre = "";
      await me.save();
      return Response.json({ success: true, equipados: me.cosmeticos });
    }

    const item = getCosmetic(itemId);
    if (!item) {
      return Response.json({ error: "Objeto no encontrado" }, { status: 404 });
    }
    if (!(me.cosmeticosDesbloqueados || []).includes(item.id)) {
      return Response.json({ error: "No posees este objeto" }, { status: 403 });
    }

    if (item.tipo === "marco") me.cosmeticos.marco = item.valor;
    else if (item.tipo === "titulo") me.cosmeticos.titulo = item.valor;
    else if (item.tipo === "color") me.cosmeticos.colorNombre = item.valor;
    await me.save();

    return Response.json({ success: true, equipados: me.cosmeticos });
  } catch (error) {
    console.error("Error al equipar:", error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
