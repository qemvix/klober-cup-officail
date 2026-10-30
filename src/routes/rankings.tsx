import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageTitle, SiteHeader } from "@/components/SiteHeader";
import { TierBadge } from "@/components/TierBadge";
import { ModeIcon } from "@/components/ModeIcon";
import { avatar, playersQuery } from "@/lib/klober";
import { MODES, avgElo, modeElo, playerTier, rankBy, rankLabel } from "@/lib/ranking";

export const Route = createFileRoute("/rankings")({
  head: () => ({
    meta: [
      { title: "Overall Rankings — Klober Tiers" },
      { name: "description", content: "Klober Tiers players ranked by average ELO across all ${MODES.length} gamemodes." },
      { property: "og:title", content: "Overall Rankings — Klober Tiers" },
      { property: "og:description", content: "Players ranked by average ELO across all ${MODES.length} gamemodes." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(playersQuery),
  component: Rankings,
});

function Rankings() {
  const { data } = useSuspenseQuery(playersQuery);
  const overall = rankBy(data, avgElo, (p) => p.name).sorted;
  const perMode = Object.fromEntries(MODES.map((m) => [m.slug, rankBy(data, (p) => modeElo(p, m.slug), (p) => p.name).ranks]));
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <PageTitle title="Overall Rankings" sub="Ranked by average ELO across all ${MODES.length} gamemodes." />
        <div className="mt-8 space-y-3">
          {overall.map((p, i) => (
            <Link key={p.id} to="/players/$name" params={{ name: p.name }} className="flex flex-wrap items-center gap-5 rounded-lg border bg-card p-4 transition hover:border-primary">
              <span className="w-14 font-display text-3xl font-bold text-primary">#{i + 1}</span>
              <img src={avatar(p, 48)} alt={p.name} className="h-12 w-12 rounded" />
              <div className="min-w-40">
                <div className="text-lg font-bold">{p.name}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><TierBadge tier={playerTier(p)} /> {avgElo(p)} ELO</div>
              </div>
              <div className="ml-auto flex flex-wrap gap-1.5">
                {MODES.map((m) => {
                  const r = perMode[m.slug]!.get(p.name);
                  const top = r && r.rank <= 3;
                  return (
                    <div key={m.slug} title={m.label} className="flex w-10 flex-col items-center gap-1">
                      <ModeIcon slug={m.slug} className="h-4 w-4 text-primary" />
                      <span className={`w-full rounded border px-0.5 text-center text-[10px] font-bold ${top ? "border-transparent bg-gold-gradient text-primary-foreground" : "border-primary/40 text-primary"}`}>{rankLabel(r)}</span>
                    </div>
                  );
                })}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
