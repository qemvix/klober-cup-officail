import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Hash, Pencil, Plus, Server, Trash2, X } from "lucide-react";
import { SiteHeader, PageTitle } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { cupsQuery, eventsQuery, fmtDate, modFilesQuery, playersQuery, siteContentQuery, type Cup, type DiscordInfo, type KEvent, type Player } from "@/lib/klober";
import { MODES, TIERS, avgElo, playerTier } from "@/lib/ranking";
import { resolveSkin } from "@/lib/skin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Klober Tiers" },
      { name: "description", content: "Manage Klober Tiers players, cups and events." },
      { property: "og:title", content: "Admin Panel — Klober Tiers" },
      { property: "og:description", content: "Manage players, cups and events." },
    ],
  }),
  ssr: false,
  component: Admin,
});

const toLocal = (iso: string) => { const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
const fromLocal = (v: string) => new Date(v).toISOString();
const field = "w-full rounded-md border bg-background px-3 py-2 text-foreground outline-none focus:border-primary";
const label = "mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground";
const tomorrow = () => new Date(Date.now() + 864e5).toISOString();

function Admin() {
  const [state, setState] = useState<"loading" | "out" | "notadmin" | "admin">("loading");
  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return setState("out");
      const { data: r } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin");
      setState(r && r.length ? "admin" : "notadmin");
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((e) => { if (e === "SIGNED_IN" || e === "SIGNED_OUT") check(); });
    return () => sub.subscription.unsubscribe();
  }, []);
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12">
        {state === "loading" && <p className="text-muted-foreground">Loading…</p>}
        {state === "out" && <Login />}
        {state === "notadmin" && <p>This account is not an admin. <button className="text-primary underline" onClick={() => supabase.auth.signOut()}>Sign out</button></p>}
        {state === "admin" && <Panel />}
      </main>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  return (
    <form className="mx-auto max-w-sm space-y-4 rounded-lg border bg-card p-6" onSubmit={async (e) => {
      e.preventDefault();
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) setMsg("Wrong email or password.");
    }}>
      <h1 className="font-display text-2xl font-bold text-primary">Admin Access</h1>
      <input className={field} type="email" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className={field} type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} required />
      <button className="w-full rounded-md bg-gold-gradient py-2 font-bold text-primary-foreground">Unlock</button>
      <button type="button" className="w-full text-sm text-primary underline" onClick={async () => {
        if (!email) return setMsg("Type your admin email first.");
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        setMsg(error ? error.message : "If that's the admin email, a reset link is on its way.");
      }}>Forgot password? Email me a reset link</button>
      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
    </form>
  );
}

function Panel() {
  const qc = useQueryClient();
  const players = useQuery(playersQuery).data ?? [];
  const cups = useQuery(cupsQuery).data ?? [];
  const events = useQuery(eventsQuery).data ?? [];
  const [pl, setPl] = useState<Partial<Player> | null>(null);
  const [cup, setCup] = useState<Partial<Cup> | null>(null);
  const [ev, setEv] = useState<Partial<KEvent> | null>(null);
  const [err, setErr] = useState("");
  const refresh = (k: string) => qc.invalidateQueries({ queryKey: [k] });

  const save = async (table: "players" | "cups" | "events", row: Record<string, unknown>) => {
    const { id, created_at: _c, ...rest } = row;
    const q = id ? supabase.from(table).update(rest as never).eq("id", id as string) : supabase.from(table).insert(rest as never);
    const { error } = await q;
    if (error) { setErr(error.message); return false; }
    setErr(""); refresh(table); return true;
  };
  const del = async (table: "players" | "cups" | "events", id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) setErr(error.message); else refresh(table);
  };

  return (
    <div className="space-y-14">
      <div className="flex items-center justify-between">
        <PageTitle title="Admin Panel" />
        <button className="text-sm text-muted-foreground underline" onClick={() => supabase.auth.signOut()}>Sign out</button>
      </div>
      {err && <p className="rounded-md border border-destructive p-3 text-destructive">{err}</p>}

      <Section title="Players" onAdd={() => setPl({ name: "", region: "NA", wins: 0, losses: 0, elo: {}, tier_override: null })}>
        {[...players].sort((a, b) => avgElo(b) - avgElo(a)).map((p) => (
          <Row key={p.id} title={p.name} sub={`${playerTier(p)} · ${avgElo(p)} avg ELO · ${p.region}`} onEdit={() => setPl(p)} onDelete={() => del("players", p.id, p.name)} />
        ))}
      </Section>

      <Section title="Events" onAdd={() => setEv({ title: "", description: "", server: "", channel: "", invite: "", image: "", starts_at: tomorrow() })} addLabel="Add new event">
        {events.map((e) => <Row key={e.id} title={e.title} sub={`${e.server} · #${e.channel} · ${fmtDate(e.starts_at)}`} onEdit={() => setEv(e)} onDelete={() => del("events", e.id, e.title)} />)}
      </Section>

      <Section title="ELO Cups" onAdd={() => setCup({ name: "", gamemode: "Sword", elo_reward: 25, slots: 16, starts_at: tomorrow() })}>
        {cups.map((c) => <Row key={c.id} title={c.name} sub={`${c.gamemode} · +${c.elo_reward} ELO · ${c.slots} slots · ${fmtDate(c.starts_at)}`} onEdit={() => setCup(c)} onDelete={() => del("cups", c.id, c.name)} />)}
      </Section>

      {pl && (
        <Modal onClose={() => setPl(null)}>
          <form className="w-full max-w-2xl space-y-4 rounded-lg border bg-card p-6" onSubmit={async (e) => {
            e.preventDefault();
            const nameChanged = !pl.id || players.find((x) => x.id === pl.id)?.name !== pl.name;
            let skin = pl.skin ?? null;
            if (nameChanged || !skin) skin = (await resolveSkin({ data: { name: pl.name ?? "" } }).catch(() => ({ skin: null }))).skin;
            if (await save("players", { ...pl, skin })) setPl(null);
          }}>
            <h3 className="font-display text-xl font-bold text-primary">{pl.id ? "Edit player" : "New player"}</h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <label className="col-span-2"><span className={label}>Minecraft name</span><input required className={field} value={pl.name ?? ""} onChange={(e) => setPl({ ...pl, name: e.target.value })} /></label>
              <label><span className={label}>Region</span><input className={field} value={pl.region ?? ""} onChange={(e) => setPl({ ...pl, region: e.target.value })} /></label>
              <label><span className={label}>Rank</span>
                <select className={field} value={pl.tier_override ?? ""} onChange={(e) => setPl({ ...pl, tier_override: e.target.value || null })}>
                  <option value="">Auto (from ELO)</option>
                  {TIERS.map((t) => <option key={t}>{t}</option>)}
                </select></label>
              <label><span className={label}>Wins</span><input type="number" min={0} className={field} value={pl.wins ?? 0} onChange={(e) => setPl({ ...pl, wins: +e.target.value })} /></label>
              <label><span className={label}>Losses</span><input type="number" min={0} className={field} value={pl.losses ?? 0} onChange={(e) => setPl({ ...pl, losses: +e.target.value })} /></label>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {MODES.map((m) => (
                <label key={m.slug}><span className={label}>{m.label}</span>
                  <input type="number" className={field} value={pl.elo?.[m.slug] ?? 1000} onChange={(e) => setPl({ ...pl, elo: { ...(pl.elo ?? {}), [m.slug]: +e.target.value } })} /></label>
              ))}
            </div>
            <Actions onCancel={() => setPl(null)} />
          </form>
        </Modal>
      )}

      {cup && (
        <Modal onClose={() => setCup(null)}>
          <form className="w-full max-w-md space-y-4 rounded-lg border bg-card p-6" onSubmit={async (e) => { e.preventDefault(); if (await save("cups", cup)) setCup(null); }}>
            <h3 className="font-display text-xl font-bold text-primary">{cup.id ? "Edit cup" : "New cup"}</h3>
            <label className="block"><span className={label}>Name</span><input required className={field} value={cup.name ?? ""} onChange={(e) => setCup({ ...cup, name: e.target.value })} /></label>
            <label className="block"><span className={label}>Gamemode</span>
              <select className={field} value={cup.gamemode} onChange={(e) => setCup({ ...cup, gamemode: e.target.value })}>{MODES.map((m) => <option key={m.slug}>{m.label}</option>)}</select></label>
            <div className="grid grid-cols-2 gap-3">
              <label><span className={label}>ELO reward</span><input type="number" min={0} className={field} value={cup.elo_reward ?? 0} onChange={(e) => setCup({ ...cup, elo_reward: +e.target.value })} /></label>
              <label><span className={label}>Slots</span><input type="number" min={2} className={field} value={cup.slots ?? 16} onChange={(e) => setCup({ ...cup, slots: +e.target.value })} /></label>
            </div>
            <label className="block"><span className={label}>Starts</span><input required type="datetime-local" className={field} value={toLocal(cup.starts_at!)} onChange={(e) => e.target.value && setCup({ ...cup, starts_at: fromLocal(e.target.value) })} /></label>
            <Actions onCancel={() => setCup(null)} />
          </form>
        </Modal>
      )}

      {ev && (
        <Modal onClose={() => setEv(null)}>
          <form className="w-full max-w-lg overflow-hidden rounded-lg border border-primary/40 bg-discord-panel" onSubmit={async (e) => { e.preventDefault(); if (await save("events", ev)) setEv(null); }}>
            <div className="flex items-center justify-between p-5 pb-2">
              <h3 className="text-xl font-bold">{ev.id ? "Edit Event" : "Create Event"}</h3>
              <button type="button" onClick={() => setEv(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5 pt-2">
              <p className="text-sm text-muted-foreground">Where is your event taking place?</p>
              <div className="grid grid-cols-2 gap-3">
                <label><span className={label}><Server className="mr-1 inline h-3 w-3" />Server</span><input required className={field} placeholder="Klober Tiers" value={ev.server ?? ""} onChange={(e) => setEv({ ...ev, server: e.target.value })} /></label>
                <label><span className={label}><Hash className="mr-1 inline h-3 w-3" />Channel</span><input required className={field} placeholder="event-stage" value={ev.channel ?? ""} onChange={(e) => setEv({ ...ev, channel: e.target.value.replace(/^#/, "") })} /></label>
              </div>
              <label className="block"><span className={label}>Server invite link</span><input type="url" className={field} placeholder="https://discord.gg/..." value={ev.invite ?? ""} onChange={(e) => setEv({ ...ev, invite: e.target.value })} /></label>
              <label className="block"><span className={label}>Event topic</span><input required className={field} value={ev.title ?? ""} onChange={(e) => setEv({ ...ev, title: e.target.value })} /></label>
              <label className="block"><span className={label}>Start date & time</span><input required type="datetime-local" className={field} value={toLocal(ev.starts_at!)} onChange={(e) => e.target.value && setEv({ ...ev, starts_at: fromLocal(e.target.value) })} /></label>
              <label className="block"><span className={label}>Description</span><textarea rows={3} className={field} value={ev.description ?? ""} onChange={(e) => setEv({ ...ev, description: e.target.value })} /></label>
              <label className="block"><span className={label}>Cover image URL</span><input type="url" className={field} value={ev.image ?? ""} onChange={(e) => setEv({ ...ev, image: e.target.value })} /></label>
            </div>
            <div className="bg-discord-input p-4"><Actions onCancel={() => setEv(null)} /></div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Section({ title, onAdd, addLabel = "Add", children }: { title: string; onAdd: () => void; addLabel?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-primary">{title}</h2>
        <button onClick={onAdd} className="flex items-center gap-2 rounded-md bg-gold-gradient px-4 py-2 font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> {addLabel}</button>
      </div>
      <div className="mt-4 space-y-2">{children}</div>
    </section>
  );
}

function Actions({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-2">
      <button type="button" onClick={onCancel} className="px-4 py-2 text-sm">Cancel</button>
      <button className="rounded-md bg-gold-gradient px-5 py-2 font-semibold text-primary-foreground">Save</button>
    </div>
  );
}

function Row({ title, sub, onEdit, onDelete }: { title: string; sub: string; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4">
      <div><div className="font-bold">{title}</div><div className="text-sm text-muted-foreground">{sub}</div></div>
      <div className="flex gap-2">
        <button aria-label="Edit" onClick={onEdit} className="rounded-md border p-2 hover:border-primary"><Pencil className="h-4 w-4" /></button>
        <button aria-label="Delete" onClick={onDelete} className="rounded-md border p-2 text-destructive hover:border-destructive"><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      {children}
    </div>
  );
}
