import { Link } from "@tanstack/react-router";
import { Crown } from "lucide-react";

const nav = [
  { to: "/", label: "Home" },
  { to: "/rankings", label: "Overall" },
  { to: "/admin", label: "Admin" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-border/60 bg-background/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
          <Crown className="h-5 w-5" /> Klober Tiers
        </Link>
        <nav className="flex gap-1">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }}
              className="rounded-md px-3 py-1.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
              activeProps={{ className: "bg-accent text-accent-foreground" }}>
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
