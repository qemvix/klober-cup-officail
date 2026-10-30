import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { TierBadge } from "@/components/TierBadge";
import { ModeIcon } from "@/components/ModeIcon";
import { body, playersQuery } from "@/lib/klober";
import { MODES, avgElo, modeElo, playerTier, rankBy, rankLabel } from "@/lib/ranking";

export const Route = createFileRoute("/players/$name")({
  loader: async ({ context, params }) => {
    const players = await context.queryClient.ensureQueryData(playersQuery);
    if (!players.some((p) => p.name === params.name)) throw notFound();
  },
  head: ({ params }) => ({
    meta: [
      { title: `${params.name} — Klober Tiers` },
      { name: "description", content: `${params.name}'s Klober Tiers ELO and gamemode stats.` },
      { property: "og:title", content: `${params.name} — Klober Tiers` },
      { property: "og:description", content: `${params.name}'s ELO across all ${MODES.length} gamemodes.` },
    ],
  }),
  component: PlayerPage,
});

function PlayerPage() {
  const { name } = Route.useParams();
  const { data } = useSuspenseQuery(playersQuery);
  const p = data.find((x) => x.name === name)!;
  const overall = rankBy(data, avgElo, (x) => x.name).ranks.get(name);
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-wrap items-center gap-8">
          <img src={body(p, 120)} alt={p.name} className="h-56" />
          <div>
            <h1 className="font-display text-5xl font-bold text-gold-gradient">{p.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3"><TierBadge tier={playerTier(p)} /><span className="font-bold text-primary">Overall {rankLabel(overall)}</span></div>
            <div className="mt-4 grid grid-cols-4 gap-4 text-center">
              {[["Region", p.region], ["Avg ELO", avgElo(p)], ["Wins", p.wins], ["Losses", p.losses]].map(([l, v]) => (
                <div key={l as string} className="rounded-lg border bg-card px-4 py-2"><div className="text-xs uppercase text-muted-foreground">{l}</div><div className="text-xl font-bold">{v}</div></div>
              ))}
            </div>
          </div>
        </div>
        <h2 className="mt-12 font-display text-2xl font-bold text-primary">Gamemode Stats</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {MODES.map((m) => {
            const r = rankBy(data, (x) => modeElo(x, m.slug), (x) => x.name).ranks.get(name);
            return (
              <Link key={m.slug} to="/mode/$slug" params={{ slug: m.slug }} className="rounded-lg border bg-card p-4 hover:border-primary">
                <div className="flex items-center gap-2 font-bold"><ModeIcon slug={m.slug} className="h-4 w-4 text-primary" />{m.label}<span className="ml-auto text-primary">{rankLabel(r)}</span></div>
                <div className="mt-1 text-2xl font-bold tabular-nums">{modeElo(p, m.slug)} <span className="text-sm text-muted-foreground">{r?.tied ? "Tied" : "ELO"}</span></div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
