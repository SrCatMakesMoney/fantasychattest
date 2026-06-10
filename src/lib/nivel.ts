export interface UserStats {
  posts: number;
  likesReceived: number;
  comments: number;
  badges: number;
}

export function computeXp(stats: UserStats): number {
  return (
    stats.posts * 10 +
    stats.likesReceived * 15 +
    stats.comments * 5 +
    stats.badges * 50
  );
}

export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 25)) + 1;
}

export function xpForLevel(level: number): number {
  return (level - 1) * (level - 1) * 25;
}

export function levelProgress(xp: number): {
  level: number;
  current: number;
  needed: number;
  percent: number;
} {
  const level = levelFromXp(xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const current = xp - base;
  const needed = next - base;
  return {
    level,
    current,
    needed,
    percent: Math.min(100, Math.round((current / needed) * 100)),
  };
}

export const LEVEL_TITLES: [number, string][] = [
  [20, "Leyenda de las Sombras"],
  [15, "Señor Oscuro"],
  [10, "Caballero Maldito"],
  [6, "Veterano Errante"],
  [3, "Escudero Sombrío"],
  [1, "Alma Errante"],
];

export function titleForLevel(level: number): string {
  for (const [min, title] of LEVEL_TITLES) {
    if (level >= min) return title;
  }
  return "Alma Errante";
}
