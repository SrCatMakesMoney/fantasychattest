import { Faction, IFaction } from "@/models/Faction";
import { Post } from "@/models/Post";
import { RealmEvent } from "@/models/RealmEvent";
import { User } from "@/models/User";
import { computeWeeklyActivity, getCronista } from "@/lib/reino";

export const BATTLE_COOLDOWN_MS = 6 * 60 * 60 * 1000;

export const FACTION_EMBLEMS = ["⚑", "☠", "⚔", "♛", "☽", "✠", "⚜", "♜"];

export async function computeFactionInfluence(
  factions: IFaction[]
): Promise<Map<string, number>> {
  const activity = await computeWeeklyActivity();
  const influence = new Map<string, number>();
  for (const f of factions) {
    let total = 0;
    for (const m of f.members) {
      total += 1 + (activity.get(String(m)) || 0);
    }
    influence.set(String(f._id), total);
  }
  return influence;
}

const WAR_NARRATIVES = [
  (w: string, l: string) =>
    `Los estandartes de ${w} y ${l} chocaron bajo un cielo de ceniza. Cuando el cuervo dio su último graznido, ${w} se alzaba sobre los restos del campo, y ${l} se retiró a lamer sus heridas entre las ruinas.`,
  (w: string, l: string) =>
    `La guerra llegó sin heraldos: ${w} cruzó la niebla y asaltó los bastiones de ${l}. Las murallas cedieron al alba y los bardos ya componen cantos sobre la victoria de ${w}.`,
  (w: string, l: string) =>
    `Durante tres noches ardieron los páramos mientras ${w} y ${l} libraban su contienda. El acero de ${w} resultó más afilado, y ${l} juró venganza ante sus dioses oscuros.`,
];

export async function resolveWar(attacker: IFaction, defender: IFaction) {
  const influence = await computeFactionInfluence([attacker, defender]);
  const attackerInf = influence.get(String(attacker._id)) || 1;
  const defenderInf = influence.get(String(defender._id)) || 1;

  const roll = Math.random() * (attackerInf + defenderInf);
  const winner = roll < attackerInf ? attacker : defender;
  const loser = winner === attacker ? defender : attacker;

  const narrative =
    WAR_NARRATIVES[Math.floor(Math.random() * WAR_NARRATIVES.length)];
  const text = narrative(winner.name, loser.name);

  const cronista = await getCronista();
  const post = await Post.create({
    author: cronista._id,
    content: text,
    eventType: "evento",
  });
  await RealmEvent.create({
    type: "guerra",
    title: `Guerra: ${attacker.name} contra ${defender.name}`,
    description: text,
    involvedUsers: [...winner.members],
    factions: [attacker._id, defender._id],
    post: post._id,
  });

  await User.updateMany(
    { _id: { $in: winner.members } },
    { $addToSet: { badges: "conquistador" } }
  );

  const now = new Date();
  await Faction.updateMany(
    { _id: { $in: [attacker._id, defender._id] } },
    { lastBattleAt: now }
  );

  return {
    winner: { id: String(winner._id), name: winner.name },
    loser: { id: String(loser._id), name: loser.name },
    attackerInfluence: attackerInf,
    defenderInfluence: defenderInf,
    description: text,
  };
}
