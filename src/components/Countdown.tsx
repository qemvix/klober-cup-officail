import { countdown, useNow } from "@/lib/klober";

export function Countdown({ to }: { to: string }) {
  const now = useNow();
  if (now === null) return <div className="h-14" />;
  const c = countdown(to, now);
  if (!c) return <div className="font-display text-2xl font-black uppercase text-fn">Live now!</div>;
  const parts: [number, string][] = [[c.d, "Days"], [c.h, "Hrs"], [c.m, "Min"], [c.s, "Sec"]];
  return (
    <div className="flex gap-2">
      {parts.map(([v, l]) => (
        <div key={l} className="fn-skew min-w-14 bg-background/60 px-2 py-1 text-center">
          <div className="fn-unskew text-2xl font-bold tabular-nums text-fn">{String(v).padStart(2, "0")}</div>
          <div className="fn-unskew text-[10px] font-bold uppercase tracking-widest text-foreground/70">{l}</div>
        </div>
      ))}
    </div>
  );
}
