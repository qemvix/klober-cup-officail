import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageTitle, SiteHeader } from "@/components/SiteHeader";
import { TierBadge } from "@/components/TierBadge";
import { avatar, playersQuery } from "@/lib/klober";
import { MODES, modeElo, rankBy, rankLabel, tierFor } from "@/lib/ranking";

export const Route = createFileRoute("/mode/$slug")({
  loader: ({ context, params }) => {
    const mode = MODES.find((m) => m.slug === params.slug);
    if (!mode) throw notFound();
    return context.queryClient.ensureQueryData(playersQuery).then(() => ({ label: mode.label }));
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.label ?? "Gamemode"} Rankings — Klober Tiers` },
      { name: "description", content: `Klober Tiers ${loaderData?.label ?? ""} leaderboard.` },
      { property: "og:title", content: `${loaderData?.label ?? "Gamemode"} Rankings — Klober Tiers` },
      { property: "og:description", content: `Who's on top in ${loaderData?.label ?? "this gamemode"}.` },
    ],
  }),
  component: Mode,
});

function Mode() {
  const { slug } = Route.useParams();
  const { label } = Route.useLoaderData();
  const { data } = useSuspenseQuery(playersQuery);
  const { sorted, ranks } = rankBy(data, (p) => modeElo(p, slug), (p) => p.name);
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <PageTitle title={`${label} Rankings`} />
        <div className="mt-8 space-y-3">
          {sorted.map((p) => {
            const e = modeElo(p, slug);
            return (
              <Link key={p.id} to="/players/$name" params={{ name: p.name }} className="flex items-center gap-5 rounded-lg border bg-card p-4 hover:border-primary">
                <span className="w-16 font-display text-3xl font-bold text-primary">{rankLabel(ranks.get(p.name))}</span>
                <img src={avatar(p, 48)} alt="" className="h-12 w-12 rounded" />
                <div className="text-lg font-bold">{p.name}</div>
                <div className="ml-auto flex items-center gap-3"><TierBadge tier={tierFor(e)} /><span className="font-bold tabular-nums">{e} ELO</span></div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
