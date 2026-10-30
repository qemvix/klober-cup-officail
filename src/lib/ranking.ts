export const MODES = [
  { slug: "diamond-smp", label: "Diamond SMP" },
  { slug: "lt-cart", label: "LT Cart" },
  { slug: "ht-cart", label: "HT Cart" },
  { slug: "creeper", label: "Creeper" },
  { slug: "uhc", label: "UHC" },
  { slug: "sword", label: "Sword" },
  { slug: "smp", label: "SMP" },
  { slug: "axe", label: "Axe" },
  { slug: "mace", label: "Mace" },
  { slug: "nethpot", label: "Nethpot" },
  { slug: "crystal", label: "Crystal" },
  { slug: "pot", label: "Pot" },
  { slug: "elytra-mace", label: "Elytra Mace" },
  { slug: "spear-mace", label: "Spear Mace" },
  { slug: "trident", label: "Trident" },
] as const;
export type ModeSlug = (typeof MODES)[number]["slug"];

export const TIERS = ["Emerald", "Diamond", "Gold", "Iron"] as const;
export type Tier = (typeof TIERS)[number];
export const DEFAULT_ELO = 1000;
export const TIE_RANGE = 25;

export function tierFor(elo: number): Tier {
  if (elo >= 1700) return "Emerald";
  if (elo >= 1500) return "Diamond";
  if (elo >= 1300) return "Gold";
  return "Iron";
}

export type RankablePlayer = { name: string; elo: Record<string, number>; tier_override?: string | null };

export const modeElo = (p: RankablePlayer, m: string) => {
  const value = p.elo?.[m];
  return typeof value === "number" && Number.isFinite(value) ? value : DEFAULT_ELO;
};
export const avgElo = (p: RankablePlayer) =>
  Math.round(MODES.reduce((s, m) => s + modeElo(p, m.slug), 0) / MODES.length);
export const playerTier = (p: RankablePlayer): Tier =>
  (TIERS as readonly string[]).includes(p.tier_override ?? "") ? (p.tier_override as Tier) : tierFor(avgElo(p));

export type RankEntry = { rank: number; tied: boolean; elo: number };

/** Ranks by value desc. Players within TIE_RANGE of their group's leader share the spot. */
export function rankBy<T>(items: T[], value: (t: T) => number, key: (t: T) => string) {
  const sorted = [...items].sort((a, b) => value(b) - value(a));
  const out = new Map<string, RankEntry>();
  let i = 0;
  while (i < sorted.length) {
    const lead = value(sorted[i]!);
    let j = i;
    while (j < sorted.length && lead - value(sorted[j]!) <= TIE_RANGE) j++;
    for (let k = i; k < j; k++) out.set(key(sorted[k]!), { rank: i + 1, tied: j - i > 1, elo: value(sorted[k]!) });
    i = j;
  }
  return { sorted, ranks: out };
}

export const rankLabel = (r?: RankEntry) => (r ? `#${r.rank}${r.tied ? "=" : ""}` : "—");
