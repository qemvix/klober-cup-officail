import { Link } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import { MODES } from "@/lib/ranking";
import { ModeIcon } from "./ModeIcon";

const nav = [
  { to: "/rankings", label: "Leaderboard" },
  { to: "/elo", label: "ELO" },
  { to: "/ties", label: "Ties" },
  { to: "/cups", label: "Cups" },
  { to: "/events", label: "Events" },
  { to: "/mod", label: "Mod" },
  { to: "/discord", label: "Discord" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/admin", label: "Admin" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
          <Crown className="h-5 w-5" /> Klober Tiers
        </Link>
        <nav className="flex flex-wrap gap-1">
          {nav.map((n) => (
            <Link key={n.to} to={n.to}
              className="rounded-md px-3 py-1.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
              activeProps={{ className: "bg-accent text-accent-foreground" }}>
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-6 pb-3">
        {MODES.map((m) => (
          <Link key={m.slug} to="/mode/$slug" params={{ slug: m.slug }}
            className="flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-foreground"
            activeProps={{ className: "border-primary text-primary" }}>
            <ModeIcon slug={m.slug} className="h-3.5 w-3.5 text-primary" /> {m.label}
          </Link>
        ))}
      </div>
    </header>
  );
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div>
      <h1 className="font-display text-4xl font-bold text-gold-gradient md:text-5xl">{title}</h1>
      {sub && <p className="mt-2 text-muted-foreground">{sub}</p>}
    </div>
  );
}
