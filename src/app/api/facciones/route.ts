import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { Faction } from "@/models/Faction";
import { User } from "@/models/User";
import { RealmEvent } from "@/models/RealmEvent";
import { Post } from "@/models/Post";
import {
  computeFactionInfluence,
  FACTION_EMBLEMS,
  BATTLE_COOLDOWN_MS,
} from "@/lib/facciones";
import { getCronista } from "@/lib/reino";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    await connectDB();
    const factions = await Faction.find()
      .populate("leader", "username displayName avatar")
      .populate("members", "username displayName avatar")
      .sort({ createdAt: 1 });

    const influence = await computeFactionInfluence(factions);
    const now = Date.now();

    const me = await User.findById(session.userId).select("faction");

    return Response.json({
      facciones: factions
        .map((f) => ({
          _id: f._id,
          name: f.name,
          motto: f.motto,
          emblem: f.emblem,
          leader: f.leader,
          members: f.members,
          influence: influence.get(String(f._id)) || 0,
          enGuerraCooldown: f.lastBattleAt
            ? now - new Date(f.lastBattleAt).getTime() < BATTLE_COOLDOWN_MS
            : false,
          createdAt: f.createdAt,
        }))
        .sort((a, b) => b.influence - a.influence),
      miFaccion: me?.faction ? String(me.faction) : null,
    });
  } catch (error) {
    console.error("Error al listar facciones:", error);
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
    if (me.faction) {
      return Response.json(
        { error: "Ya juraste lealtad a una facción" },
        { status: 400 }
      );
    }

    const { name, motto, emblem } = await request.json();
    if (!name || name.trim().length < 3) {
      return Response.json(
        { error: "El nombre debe tener al menos 3 caracteres" },
        { status: 400 }
      );
    }
    if (name.trim().length > 40) {
      return Response.json({ error: "Nombre muy largo (max 40)" }, { status: 400 });
    }

    const existing = await Faction.findOne({ name: name.trim() });
    if (existing) {
      return Response.json(
        { error: "Ya existe una facción con ese nombre" },
        { status: 400 }
      );
    }

    const faction = await Faction.create({
      name: name.trim(),
      motto: (motto || "").trim().slice(0, 120),
      emblem: FACTION_EMBLEMS.includes(emblem) ? emblem : FACTION_EMBLEMS[0],
      leader: me._id,
      members: [me._id],
    });

    me.faction = faction._id;
    await me.save();
    await User.updateOne(
      { _id: me._id },
      { $addToSet: { badges: "fundador" } }
    );

    const cronista = await getCronista();
    const text = `Un nuevo estandarte se alza sobre las tierras oscuras: ${me.displayName} ha fundado la facción ${faction.emblem} ${faction.name}. Que tiemblen sus enemigos.`;
    const post = await Post.create({
      author: cronista._id,
      content: text,
      eventType: "evento",
    });
    await RealmEvent.create({
      type: "guerra",
      title: `Nace la facción ${faction.name}`,
      description: text,
      involvedUsers: [me._id],
      factions: [faction._id],
      post: post._id,
    });

    return Response.json({ faccion: faction }, { status: 201 });
  } catch (error) {
    console.error("Error al crear facción:", error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
