import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { Faction } from "@/models/Faction";
import { User } from "@/models/User";

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
    if (me.faction) {
      return Response.json(
        { error: "Ya perteneces a una facción. Abandónala primero." },
        { status: 400 }
      );
    }

    const { factionId } = await request.json();
    const faction = await Faction.findById(factionId);
    if (!faction) {
      return Response.json({ error: "Facción no encontrada" }, { status: 404 });
    }

    await Faction.updateOne(
      { _id: faction._id },
      { $addToSet: { members: me._id } }
    );
    me.faction = faction._id;
    await me.save();

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error al unirse a facción:", error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    await connectDB();
    const me = await User.findById(session.userId);
    if (!me || !me.faction) {
      return Response.json(
        { error: "No perteneces a ninguna facción" },
        { status: 400 }
      );
    }

    const faction = await Faction.findById(me.faction);
    if (faction) {
      await Faction.updateOne(
        { _id: faction._id },
        { $pull: { members: me._id } }
      );

      const remaining = faction.members.filter(
        (m) => String(m) !== String(me._id)
      );
      if (remaining.length === 0) {
        await Faction.deleteOne({ _id: faction._id });
      } else if (String(faction.leader) === String(me._id)) {
        await Faction.updateOne(
          { _id: faction._id },
          { leader: remaining[0] }
        );
      }
    }

    me.faction = null;
    await me.save();

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error al abandonar facción:", error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
