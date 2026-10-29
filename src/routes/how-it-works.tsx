import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, CalendarClock, Crown, Scale, Trophy, Gamepad2 } from "lucide-react";
import { PageTitle, SiteHeader } from "@/components/SiteHeader";
import { TierBadge } from "@/components/TierBadge";
import { MODES } from "@/lib/ranking";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — Klober Tiers" },
      { name: "description", content: "How Klober Tiers ELO, tiers, ties, cups and events work." },
      { property: "og:title", content: "How it works — Klober Tiers" },
      { property: "og:description", content: "ELO, tiers, ties, cups and events explained." },
    ],
  }),
  component: How,
});

function How() {
  const items = [
    { icon: Gamepad2, title: "10 gamemodes", body: `Every player has their own ELO in each gamemode: ${MODES.map((m) => m.label).join(", ")}. New players start at 1000 ELO.` },
    { icon: BarChart3, title: "Kill ELO & daily cap", body: "Killing a tier-listed player awards +10 ELO in that gamemode; killing an unlisted player awards +1. Each victim's first 20 deaths per UTC day count toward ELO awards across all supported servers and gamemodes; later kills award no ELO." },
    { icon: Scale, title: "Consecutive deaths", body: "Every 10 consecutive deaths applies a 10 ELO penalty to a tier-listed victim in the gamemode of that death. Any kill resets the killer's streak." },
    { icon: BarChart3, title: "Overall ranking", body: "Your overall ELO is the average of all 10 gamemodes. The leaderboard is sorted by that average, and the top 3 stand on the podium on the main menu." },
    { icon: Crown, title: "Tiers", body: "Your tier comes from your average ELO.", tiers: true },
    { icon: Scale, title: "Ties", body: "If players are within 25 ELO of each other in a gamemode, they share the same spot. Shared spots show an = sign, like #1=." },
    { icon: Trophy, title: "ELO Cups", body: "Cups are tournaments in one gamemode. Each cup shows how much ELO you can win, how many slots there are, and when it starts." },
    { icon: CalendarClock, title: "Events", body: "Events happen in a Discord server. Each one shows the server, the channel and a countdown to when it starts. Hit Join to get the invite." },
  ];
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <PageTitle title="How it works" />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {items.map((it) => (
            <div key={it.title} className="rounded-lg border bg-card p-5">
              <div className="flex items-center gap-2 font-display text-xl font-bold text-primary"><it.icon className="h-5 w-5" /> {it.title}</div>
              <p className="mt-2 text-foreground/85">{it.body}</p>
              {it.tiers && (
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex items-center gap-2"><TierBadge tier="Emerald" /> 1700+</div>
                  <div className="flex items-center gap-2"><TierBadge tier="Diamond" /> 1500+</div>
                  <div className="flex items-center gap-2"><TierBadge tier="Gold" /> 1300+</div>
                  <div className="flex items-center gap-2"><TierBadge tier="Iron" /> below 1300</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
