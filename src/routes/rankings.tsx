import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { PLAYERS, avatar } from "@/lib/klober";

export const Route = createFileRoute("/rankings")({
  head: () => ({
    meta: [
      { title: "Overall Rankings — Klober Tiers" },
      { name: "description", content: "Klober Tiers players ranked by average ELO." },
      { property: "og:title", content: "Overall Rankings — Klober Tiers" },
      { property: "og:description", content: "Players ranked by average ELO across all gamemodes." },
    ],
  }),
  component: Rankings,
});

const tierCls = { Emerald: "text-emerald border-emerald", Gold: "text-gold border-gold", Iron: "text-muted-foreground border-border" };

function Rankings() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-14">
        <h1 className="font-display text-5xl font-bold text-gold-gradient">Overall Rankings</h1>
        <p className="mt-2 text-muted-foreground">Ranked by average ELO across all gamemodes.</p>
        <div className="mt-8 space-y-3">
          {PLAYERS.map((p, i) => (
            <div key={p.name} className="flex items-center gap-5 rounded-lg border bg-card p-4">
              <span className="w-14 font-display text-3xl font-bold text-primary">#{i + 1}</span>
              <img src={avatar(p.name, 48)} alt={p.name} className="h-12 w-12 rounded" />
              <div>
                <div className="text-lg font-bold">{p.name}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className={`rounded border px-2 text-xs font-bold uppercase ${tierCls[p.tier]}`}>{p.tier}</span>
                  {p.elo} ELO
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
