import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CalendarClock, Scale, Trophy, ListOrdered, BarChart3 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { CupsSection, EventsSection, Podium } from "@/components/Sections";
import { cupsQuery, eventsQuery, playersQuery } from "@/lib/klober";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Klober Tiers — Main Menu" },
      { name: "description", content: "Klober Tiers top players, ELO cups and upcoming events." },
      { property: "og:title", content: "Klober Tiers — Main Menu" },
      { property: "og:description", content: "Top 3 podium, ELO cups and live event countdowns." },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(playersQuery),
      context.queryClient.ensureQueryData(cupsQuery),
      context.queryClient.ensureQueryData(eventsQuery),
    ]),
  component: Home,
});

const quick = [
  { to: "/rankings", label: "Leaderboard", icon: ListOrdered },
  { to: "/elo", label: "ELO Board", icon: BarChart3 },
  { to: "/ties", label: "Ties", icon: Scale },
  { to: "/cups", label: "Cups", icon: Trophy },
  { to: "/events", label: "Events", icon: CalendarClock },
  { to: "/how-it-works", label: "How it works", icon: BookOpen },
] as const;

function Home() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-24 px-6 pb-24">
        <div>
          <h1 className="pt-14 text-center font-display text-6xl font-black uppercase tracking-wide text-gold-gradient md:text-8xl">Klober Tiers</h1>
          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-3">
            {quick.map((q) => (
              <Link key={q.to} to={q.to} className="flex items-center justify-center gap-2 rounded-lg border border-primary/40 bg-card px-4 py-3 font-bold uppercase tracking-wider text-primary transition hover:bg-gold-gradient hover:text-primary-foreground">
                <q.icon className="h-4 w-4" /> {q.label}
              </Link>
            ))}
          </div>
          <div className="mt-16"><Podium /></div>
        </div>
        <CupsSection />
        <EventsSection />
      </main>
    </div>
  );
}
