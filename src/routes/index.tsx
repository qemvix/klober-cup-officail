import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Hash, Swords, Trophy, Users } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Countdown } from "@/components/Countdown";
import { PLAYERS, avatar, useStore } from "@/lib/klober";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Klober Tiers — Main Menu" },
      { name: "description", content: "Klober Tiers top players, ELO cups and upcoming Discord events." },
      { property: "og:title", content: "Klober Tiers — Main Menu" },
      { property: "og:description", content: "Top 3 podium, ELO cups and live event countdowns." },
    ],
  }),
  component: Home,
});

const podium = [
  { idx: 1, h: "h-40", color: "bg-silver", place: "2nd", delay: "0.3s" },
  { idx: 0, h: "h-56", color: "bg-gold-gradient", place: "1st", delay: "0.6s" },
  { idx: 2, h: "h-28", color: "bg-bronze", place: "3rd", delay: "0s" },
];

function Home() {
  const { cups, events } = useStore();
  const fmt = (d: string) => new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 pb-24">
        <h1 className="pt-16 text-center font-display text-6xl font-black uppercase tracking-wide text-gold-gradient md:text-8xl">
          Klober Tiers
        </h1>

        {/* Podium */}
        <section className="mt-14 flex items-end justify-center gap-3 md:gap-6">
          {podium.map((p) => {
            const pl = PLAYERS[p.idx];
            if (!pl) return null;
            return (
              <Link key={pl.name} to="/rankings" className="flex w-28 flex-col items-center md:w-44">
                <div className="animate-pop mb-3 flex flex-col items-center" style={{ animationDelay: `calc(${p.delay} + .7s)` }}>
                  <img src={avatar(pl.name, 96)} alt={pl.name} className={`rounded-md ${p.idx === 0 ? "h-24 w-24 shadow-gold" : "h-16 w-16"}`} />
                  <div className="mt-2 text-lg font-bold">{pl.name}</div>
                  <div className="text-sm text-muted-foreground">{pl.elo} ELO</div>
                </div>
                <div className={`animate-rise ${p.h} ${p.color} flex w-full items-start justify-center rounded-t-lg pt-3`} style={{ animationDelay: p.delay }}>
                  <span className="font-display text-4xl font-black text-primary-foreground">{p.place}</span>
                </div>
              </Link>
            );
          })}
        </section>

        {/* ELO Cups */}
        <section className="mt-24">
          <h2 className="flex items-center gap-3 font-display text-3xl font-bold text-primary"><Trophy /> ELO Cups</h2>
          <p className="mt-1 text-muted-foreground">Compete in cups to earn ELO.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {cups.length === 0 && <p className="text-muted-foreground">No cups yet.</p>}
            {cups.map((c) => (
              <div key={c.id} className="rounded-lg border bg-card p-5 transition hover:border-primary">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{c.gamemode}</div>
                    <div className="font-display text-xl font-bold">{c.name}</div>
                  </div>
                  <div className="rounded-md bg-gold-gradient px-3 py-1 text-sm font-black text-primary-foreground">+{c.eloReward} ELO</div>
                </div>
                <div className="mt-4 flex gap-5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" />{c.slots} slots</span>
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{fmt(c.startsAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Events - compete tab */}
        <section className="mt-24">
          <div className="fn-skew inline-block bg-fn px-6 py-2">
            <h2 className="fn-unskew flex items-center gap-2 font-display text-3xl font-black uppercase italic text-fn-foreground"><Swords /> Compete</h2>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {events.length === 0 && <p className="text-muted-foreground">No events scheduled.</p>}
            {events.map((e) => (
              <div key={e.id} className="overflow-hidden rounded-lg border-2 border-fn/40 bg-fn-gradient">
                {e.image && <img src={e.image} alt="" className="h-36 w-full object-cover" />}
                <div className="p-5">
                  <div className="text-xs font-bold uppercase tracking-widest text-fn">{e.server} · <Hash className="inline h-3 w-3" />{e.channel}</div>
                  <div className="mt-1 font-display text-2xl font-black uppercase italic">{e.title}</div>
                  <p className="mt-1 text-sm text-foreground/80">{e.description}</p>
                  <div className="mt-2 text-xs text-foreground/70">{fmt(e.startsAt)}</div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <Countdown to={e.startsAt} />
                    {e.invite && (
                      <a href={e.invite} target="_blank" rel="noreferrer" className="fn-skew bg-fn px-5 py-2 font-black uppercase text-fn-foreground hover:brightness-110">
                        <span className="fn-unskew inline-block">Join</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
