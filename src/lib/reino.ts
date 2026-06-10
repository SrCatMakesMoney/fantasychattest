import crypto from "crypto";
import bcrypt from "bcryptjs";
import { User, IUser } from "@/models/User";
import { Post } from "@/models/Post";
import { Comment } from "@/models/Comment";
import { Reign, IReign } from "@/models/Reign";
import { RealmEvent, RealmEventType } from "@/models/RealmEvent";

const CRONISTA_USERNAME = "el_cronista";
const EVENT_INTERVAL_MS = 20 * 60 * 60 * 1000; // ~1 evento al día

export function getWeekKey(date = new Date()): string {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export async function getCronista(): Promise<IUser> {
  let cronista = await User.findOne({ username: CRONISTA_USERNAME });
  if (!cronista) {
    const randomPass = await bcrypt.hash(
      crypto.randomBytes(32).toString("hex"),
      10
    );
    cronista = await User.create({
      username: CRONISTA_USERNAME,
      displayName: "El Cronista",
      password: randomPass,
      bio: "Voz inmortal que registra la historia del reino.",
      realm: "Biblioteca de los Siglos",
    });
  }
  return cronista;
}

async function awardBadge(userIds: string[], badgeId: string) {
  if (userIds.length === 0) return;
  await User.updateMany(
    { _id: { $in: userIds } },
    { $addToSet: { badges: badgeId } }
  );
}

interface Candidate {
  userId: string;
  displayName: string;
  weight: number;
}

async function computeCandidates(): Promise<Candidate[]> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const cronista = await getCronista();

  const users = await User.find({ _id: { $ne: cronista._id } }).select(
    "displayName"
  );
  if (users.length === 0) return [];

  const [postStats, commentStats] = await Promise.all([
    Post.aggregate([
      { $match: { createdAt: { $gte: since }, eventType: "" } },
      {
        $group: {
          _id: "$author",
          posts: { $sum: 1 },
          likesReceived: { $sum: { $size: { $ifNull: ["$likes", []] } } },
        },
      },
    ]),
    Comment.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$author", comments: { $sum: 1 } } },
    ]),
  ]);

  const postMap = new Map(postStats.map((s) => [String(s._id), s]));
  const commentMap = new Map(commentStats.map((s) => [String(s._id), s]));

  return users.map((u) => {
    const id = String(u._id);
    const p = postMap.get(id);
    const c = commentMap.get(id);
    const weight =
      1 +
      (p?.posts || 0) * 2 +
      (p?.likesReceived || 0) * 3 +
      (c?.comments || 0);
    return { userId: id, displayName: u.displayName, weight };
  });
}

function weightedPick(candidates: Candidate[]): Candidate {
  const total = candidates.reduce((s, c) => s + c.weight, 0);
  let r = Math.random() * total;
  for (const c of candidates) {
    r -= c.weight;
    if (r <= 0) return c;
  }
  return candidates[candidates.length - 1];
}

export async function ensureReign(): Promise<IReign | null> {
  const weekKey = getWeekKey();
  const existing = await Reign.findOne({ weekKey });
  if (existing) return existing;

  const candidates = await computeCandidates();
  if (candidates.length === 0) return null;

  const chosen = weightedPick(candidates);

  let reign: IReign;
  try {
    reign = await Reign.create({ king: chosen.userId, weekKey });
  } catch {
    // otra petición coronó primero
    return Reign.findOne({ weekKey });
  }

  const previous = await Reign.findOne({ weekKey: { $ne: weekKey } })
    .sort({ createdAt: -1 })
    .limit(1);
  if (previous) {
    await User.updateOne(
      { _id: previous.king },
      { $pull: { badges: "rey" } }
    );
    await awardBadge([String(previous.king)], "ex_rey");
  }
  await awardBadge([chosen.userId], "rey");

  const cronista = await getCronista();
  const content = `¡Larga vida al rey! Las campanas del castillo repican entre la niebla: ${chosen.displayName} ha sido coronado soberano de las tierras oscuras esta semana (${weekKey}). Que los súbditos rindan tributo... o conspiren en las sombras.`;
  const post = await Post.create({
    author: cronista._id,
    content,
    eventType: "coronacion",
  });
  await RealmEvent.create({
    type: "coronacion",
    title: `Coronación de ${chosen.displayName}`,
    description: content,
    involvedUsers: [chosen.userId],
    post: post._id,
  });

  return reign;
}

interface EventTemplate {
  type: RealmEventType;
  badge: string;
  usersNeeded: number;
  title: (names: string[]) => string;
  text: (names: string[]) => string;
}

const EVENT_TEMPLATES: EventTemplate[] = [
  {
    type: "plaga",
    badge: "superviviente",
    usersNeeded: 2,
    title: () => `La plaga de las sombras`,
    text: (n) =>
      `Una plaga de sombras reptó por las aldeas del reino, segando almas a su paso. ${n[0]} y ${n[1]} resistieron el mal y ahora portan la marca de los supervivientes.`,
  },
  {
    type: "batalla",
    badge: "veterano",
    usersNeeded: 2,
    title: () => `Batalla en los páramos`,
    text: (n) =>
      `El acero cantó en los páramos helados cuando estalló la batalla. ${n[0]} y ${n[1]} lucharon hombro con hombro hasta el alba y son nombrados veteranos del reino.`,
  },
  {
    type: "festin",
    badge: "invitado_real",
    usersNeeded: 2,
    title: () => `Festín en el gran salón`,
    text: (n) =>
      `Las puertas del gran salón se abrieron para un festín de hidromiel y carne asada bajo candelabros de hierro. ${n[0]} y ${n[1]} ocuparon asiento de honor en la mesa real.`,
  },
  {
    type: "profecia",
    badge: "elegido",
    usersNeeded: 1,
    title: () => `La profecía del oráculo`,
    text: (n) =>
      `El oráculo de la torre despertó de su trance milenario y susurró un único nombre: ${n[0]}. El reino aguarda, en silencio, el cumplimiento de la profecía.`,
  },
];

export async function maybeGenerateEvent(): Promise<void> {
  const lastAuto = await RealmEvent.findOne({
    type: { $in: ["plaga", "batalla", "festin", "profecia"] },
  }).sort({ createdAt: -1 });
  if (
    lastAuto &&
    Date.now() - new Date(lastAuto.createdAt).getTime() < EVENT_INTERVAL_MS
  ) {
    return;
  }

  const cronista = await getCronista();
  const users = await User.aggregate([
    { $match: { _id: { $ne: cronista._id } } },
    { $sample: { size: 2 } },
    { $project: { displayName: 1 } },
  ]);
  if (users.length === 0) return;

  const eligible = EVENT_TEMPLATES.filter((t) => t.usersNeeded <= users.length);
  if (eligible.length === 0) return;
  const template = eligible[Math.floor(Math.random() * eligible.length)];
  const chosen = users.slice(0, template.usersNeeded);
  const names = chosen.map((u) => u.displayName as string);
  const ids = chosen.map((u) => String(u._id));

  const text = template.text(names);
  const post = await Post.create({
    author: cronista._id,
    content: text,
    eventType: "evento",
  });
  await RealmEvent.create({
    type: template.type,
    title: template.title(names),
    description: text,
    involvedUsers: ids,
    post: post._id,
  });
  await awardBadge(ids, template.badge);
}
