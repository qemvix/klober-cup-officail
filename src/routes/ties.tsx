import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageTitle, SiteHeader } from "@/components/SiteHeader";
import { ModeIcon } from "@/components/ModeIcon";
import { avatar, playersQuery } from "@/lib/klober";
import { MODES, TIE_RANGE, modeElo, rankBy } from "@/lib/ranking";

export const Route = createFileRoute("/ties")({
  head: () => ({
    meta: [
      { title: "Ties — Klober Tiers" },
      { name: "description", content: "Klober Tiers players who share a spot in each gamemode." },
      { property: "og:title", content: "Ties — Klober Tiers" },
      { property: "og:description", content: "Players within 25 ELO of each other share the same spot." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(playersQuery),
  component: Ties,
});

function Ties() {
  const { data } = useSuspenseQuery(playersQuery);
  const groups = MODES.flatMap((m) => {
    const { sorted, ranks } = rankBy(data, (p) => modeElo(p, m.slug), (p) => p.name);
    const byRank = new Map<number, typeof sorted>();
    sorted.forEach((p) => {
      const r = ranks.get(p.name)!;
      if (r.tied) byRank.set(r.rank, [...(byRank.get(r.rank) ?? []), p]);
    });
    return [...byRank.entries()].map(([rank, players]) => ({ mode: m, rank, players }));
  });
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <PageTitle title="Ties" sub={`Players within ${TIE_RANGE} ELO of each other share the same spot.`} />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {groups.length === 0 && <p className="text-muted-foreground">No ties right now.</p>}
          {groups.map((g) => (
            <div key={`${g.mode.slug}-${g.rank}`} className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 font-bold">
                <ModeIcon slug={g.mode.slug} className="h-4 w-4 text-primary" /> {g.mode.label}
                <span className="ml-auto text-sm text-primary">Tied for #{g.rank}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {g.players.map((p) => (
                  <Link key={p.id} to="/players/$name" params={{ name: p.name }} className="flex items-center gap-2 rounded-md border px-2 py-1 hover:border-primary">
                    <img src={avatar(p, 24)} alt="" className="h-6 w-6 rounded-sm" />
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-sm text-muted-foreground">{modeElo(p, g.mode.slug)}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
