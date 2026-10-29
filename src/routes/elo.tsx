import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageTitle, SiteHeader } from "@/components/SiteHeader";
import { TierBadge } from "@/components/TierBadge";
import { avatar, playersQuery } from "@/lib/klober";
import { MODES, avgElo, modeElo, playerTier, rankBy } from "@/lib/ranking";

export const Route = createFileRoute("/elo")({
  head: () => ({
    meta: [
      { title: "ELO Board — Klober Tiers" },
      { name: "description", content: "Every Klober Tiers player's ELO in every gamemode." },
      { property: "og:title", content: "ELO Board — Klober Tiers" },
      { property: "og:description", content: "Every player's ELO in every gamemode." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(playersQuery),
  component: Elo,
});

function Elo() {
  const { data } = useSuspenseQuery(playersQuery);
  const rows = rankBy(data, avgElo, (p) => p.name).sorted;
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <PageTitle title="ELO Board" />
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="flex items-center gap-2"><TierBadge tier="Emerald" /> 1700+</span>
          <span className="flex items-center gap-2"><TierBadge tier="Diamond" /> 1500+</span>
          <span className="flex items-center gap-2"><TierBadge tier="Gold" /> 1300+</span>
          <span className="flex items-center gap-2"><TierBadge tier="Iron" /> below 1300</span>
        </div>
        <div className="mt-8 overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Player</th><th className="p-3 text-primary">Avg</th>
                {MODES.map((m) => <th key={m.slug} className="p-3 whitespace-nowrap">{m.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-accent/40">
                  <td className="p-3">
                    <Link to="/players/$name" params={{ name: p.name }} className="flex items-center gap-2 font-bold">
                      <img src={avatar(p, 24)} alt="" className="h-6 w-6 rounded-sm" /> {p.name} <TierBadge tier={playerTier(p)} />
                    </Link>
                  </td>
                  <td className="p-3 text-center font-bold text-primary">{avgElo(p)}</td>
                  {MODES.map((m) => <td key={m.slug} className="p-3 text-center tabular-nums">{modeElo(p, m.slug)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
