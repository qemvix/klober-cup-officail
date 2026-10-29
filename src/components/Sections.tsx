import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Calendar, Hash, Swords, Trophy, Users } from "lucide-react";
import { Countdown } from "./Countdown";
import { avatar, cupsQuery, eventsQuery, fmtDate, playersQuery } from "@/lib/klober";
import { avgElo, rankBy } from "@/lib/ranking";

export function Podium() {
  const { data } = useSuspenseQuery(playersQuery);
  const top = rankBy(data, avgElo, (p) => p.name).sorted.slice(0, 3);
  const layout = [
    { i: 1, h: "h-40", color: "bg-silver", place: "2nd", delay: "0.3s" },
    { i: 0, h: "h-56", color: "bg-gold-gradient", place: "1st", delay: "0.6s" },
    { i: 2, h: "h-28", color: "bg-bronze", place: "3rd", delay: "0s" },
  ];
  return (
    <section className="flex items-end justify-center gap-3 md:gap-6">
      {layout.map((l) => {
        const p = top[l.i];
        if (!p) return null;
        return (
          <Link key={p.id} to="/players/$name" params={{ name: p.name }} className="flex w-28 flex-col items-center md:w-44">
            <div className="animate-pop mb-3 flex flex-col items-center" style={{ animationDelay: `calc(${l.delay} + .7s)` }}>
              <img src={avatar(p, 96)} alt={p.name} className={`rounded-md ${l.i === 0 ? "h-24 w-24 shadow-gold" : "h-16 w-16"}`} />
              <div className="mt-2 text-lg font-bold">{p.name}</div>
              <div className="text-sm text-muted-foreground">{avgElo(p)} ELO</div>
            </div>
            <div className={`animate-rise ${l.h} ${l.color} flex w-full items-start justify-center rounded-t-lg pt-3`} style={{ animationDelay: l.delay }}>
              <span className="font-display text-4xl font-black text-primary-foreground">{l.place}</span>
            </div>
          </Link>
        );
      })}
    </section>
  );
}

export function CupsSection() {
  const { data: cups } = useSuspenseQuery(cupsQuery);
  return (
    <section>
      <h2 className="flex items-center gap-3 font-display text-3xl font-bold text-primary"><Trophy /> ELO Cups</h2>
      <p className="mt-1 text-muted-foreground">Compete in cups to earn ELO.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {cups.length === 0 && <p className="text-muted-foreground">No cups yet.</p>}
        {cups.map((c) => (
          <div key={c.id} className="rounded-lg border bg-card p-5 transition hover:border-primary">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{c.gamemode}</div>
                <div className="font-display text-xl font-bold">{c.name}</div>
              </div>
              <div className="shrink-0 rounded-md bg-gold-gradient px-3 py-1 text-sm font-black text-primary-foreground">+{c.elo_reward} ELO</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="h-4 w-4" />{c.slots} slots</span>
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{fmtDate(c.starts_at)}</span>
            </div>
            <div className="mt-4"><Countdown to={c.starts_at} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function EventsSection() {
  const { data: events } = useSuspenseQuery(eventsQuery);
  return (
    <section>
      <div className="fn-skew inline-block bg-gold-gradient px-6 py-2">
        <h2 className="fn-unskew flex items-center gap-2 font-display text-3xl font-black uppercase italic text-primary-foreground"><Swords /> Compete</h2>
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {events.length === 0 && <p className="text-muted-foreground">No events scheduled.</p>}
        {events.map((e) => (
          <div key={e.id} className="overflow-hidden rounded-lg border-2 border-primary/50 bg-fn-gradient">
            {e.image && <img src={e.image} alt="" className="h-36 w-full object-cover" />}
            <div className="p-5">
              <div className="text-xs font-bold uppercase tracking-widest text-primary">{e.server} · <Hash className="inline h-3 w-3" />{e.channel}</div>
              <div className="mt-1 font-display text-2xl font-black uppercase italic">{e.title}</div>
              {e.description && <p className="mt-1 text-sm text-foreground/80">{e.description}</p>}
              <div className="mt-2 text-xs text-muted-foreground">{fmtDate(e.starts_at)}</div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <Countdown to={e.starts_at} />
                {e.invite && (
                  <a href={e.invite} target="_blank" rel="noreferrer" className="fn-skew bg-gold-gradient px-5 py-2 font-black uppercase text-primary-foreground hover:brightness-110">
                    <span className="fn-unskew inline-block">Join</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
