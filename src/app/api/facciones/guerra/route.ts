import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { Faction } from "@/models/Faction";
import { User } from "@/models/User";
import { resolveWar, BATTLE_COOLDOWN_MS } from "@/lib/facciones";

export async function POST(request: NextRequest) {
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

    const attacker = await Faction.findById(me.faction);
    if (!attacker) {
      return Response.json({ error: "Facción no encontrada" }, { status: 404 });
    }
    if (String(attacker.leader) !== session.userId) {
      return Response.json(
        { error: "Solo el líder puede declarar la guerra" },
        { status: 403 }
      );
    }

    const { factionId } = await request.json();
    if (String(factionId) === String(attacker._id)) {
      return Response.json(
        { error: "No puedes declararte la guerra a ti mismo" },
        { status: 400 }
      );
    }
    const defender = await Faction.findById(factionId);
    if (!defender) {
      return Response.json(
        { error: "Facción enemiga no encontrada" },
        { status: 404 }
      );
    }

    const now = Date.now();
    for (const f of [attacker, defender]) {
      if (
        f.lastBattleAt &&
        now - new Date(f.lastBattleAt).getTime() < BATTLE_COOLDOWN_MS
      ) {
        return Response.json(
          { error: `${f.name} aún se recupera de su última batalla` },
          { status: 400 }
        );
      }
    }

    const result = await resolveWar(attacker, defender);
    return Response.json({ resultado: result }, { status: 201 });
  } catch (error) {
    console.error("Error en guerra de facciones:", error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
