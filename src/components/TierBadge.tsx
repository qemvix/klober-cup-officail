import type { Tier } from "@/lib/ranking";

const cls: Record<Tier, string> = {
  Emerald: "text-emerald border-emerald/60 bg-emerald/10",
  Diamond: "text-diamond border-diamond/60 bg-diamond/10",
  Gold: "text-gold border-gold/60 bg-gold/10",
  Iron: "text-muted-foreground border-border bg-muted",
};

export function TierBadge({ tier }: { tier: Tier }) {
  return <span className={`rounded border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${cls[tier]}`}>{tier}</span>;
}
