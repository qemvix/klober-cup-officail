import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Hash, Pencil, Plus, Server, Trash2, Trophy, X } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { useStore, type Cup, type KEvent } from "@/lib/klober";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Klober Tiers" },
      { name: "description", content: "Manage Klober Tiers ELO cups and events." },
      { property: "og:title", content: "Admin Panel — Klober Tiers" },
      { property: "og:description", content: "Create, edit and delete cups and events." },
    ],
  }),
  component: Admin,
});

const toLocal = (iso: string) => {
  const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16);
};
const blankEvent = (): Omit<KEvent, "id"> => ({ title: "", description: "", server: "", channel: "", invite: "", startsAt: new Date(Date.now() + 864e5).toISOString(), image: "" });
const blankCup = (): Omit<Cup, "id"> => ({ name: "", gamemode: "Sword", eloReward: 25, slots: 16, startsAt: new Date(Date.now() + 864e5).toISOString() });

const field = "w-full rounded-md border bg-background px-3 py-2 text-foreground outline-none focus:border-primary";
const dField = "w-full rounded-sm bg-discord-input px-3 py-2.5 text-discord-foreground outline-none";
const dLabel = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-discord-foreground/70";

function Admin() {
  const store = useStore();
  const [ev, setEv] = useState<(Omit<KEvent, "id"> & { id?: string }) | null>(null);
  const [cup, setCup] = useState<(Omit<Cup, "id"> & { id?: string }) | null>(null);
  const fmt = (d: string) => new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-14 px-6 py-14">
        <h1 className="font-display text-5xl font-bold text-gold-gradient">Admin Panel</h1>

        {/* Events */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-primary">Events</h2>
            <button onClick={() => setEv(blankEvent())} className="flex items-center gap-2 rounded-md bg-discord px-4 py-2 font-semibold text-discord-foreground hover:brightness-110">
              <Plus className="h-4 w-4" /> Add new event
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {store.events.map((e) => (
              <Row key={e.id} title={e.title} sub={`${e.server} · #${e.channel} · ${fmt(e.startsAt)}`}
                onEdit={() => setEv(e)} onDelete={() => confirm(`Delete "${e.title}"?`) && store.deleteEvent(e.id)} />
            ))}
            {store.events.length === 0 && <p className="text-muted-foreground">No events.</p>}
          </div>
        </section>

        {/* Cups */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-primary">ELO Cups</h2>
            <button onClick={() => setCup(blankCup())} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground hover:brightness-110">
              <Plus className="h-4 w-4" /> Add cup
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {store.cups.map((c) => (
              <Row key={c.id} title={c.name} sub={`${c.gamemode} · +${c.eloReward} ELO · ${c.slots} slots · ${fmt(c.startsAt)}`}
                onEdit={() => setCup(c)} onDelete={() => confirm(`Delete "${c.name}"?`) && store.deleteCup(c.id)} />
            ))}
            {store.cups.length === 0 && <p className="text-muted-foreground">No cups.</p>}
          </div>
        </section>
      </main>

      {/* Discord-style event modal */}
      {ev && (
        <Modal onClose={() => setEv(null)}>
          <form className="w-full max-w-lg overflow-hidden rounded-lg bg-discord-panel text-discord-foreground"
            onSubmit={(f) => { f.preventDefault(); store.saveEvent(ev); setEv(null); }}>
            <div className="flex items-center justify-between p-5 pb-2">
              <h3 className="text-xl font-bold">{ev.id ? "Edit Event" : "Create Event"}</h3>
              <button type="button" onClick={() => setEv(null)}><X className="h-5 w-5 opacity-70" /></button>
            </div>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5 pt-2">
              <p className="text-sm text-discord-foreground/70">Where is your event taking place?</p>
              <div className="grid grid-cols-2 gap-3">
                <label><span className={dLabel}><Server className="mr-1 inline h-3 w-3" />Server</span>
                  <input required className={dField} placeholder="Klober Tiers" value={ev.server} onChange={(x) => setEv({ ...ev, server: x.target.value })} /></label>
                <label><span className={dLabel}><Hash className="mr-1 inline h-3 w-3" />Channel</span>
                  <input required className={dField} placeholder="event-stage" value={ev.channel} onChange={(x) => setEv({ ...ev, channel: x.target.value.replace(/^#/, "") })} /></label>
              </div>
              <label className="block"><span className={dLabel}>Server invite link</span>
                <input className={dField} placeholder="https://discord.gg/..." type="url" value={ev.invite} onChange={(x) => setEv({ ...ev, invite: x.target.value })} /></label>
              <label className="block"><span className={dLabel}>Event topic</span>
                <input required className={dField} placeholder="What's your event?" value={ev.title} onChange={(x) => setEv({ ...ev, title: x.target.value })} /></label>
              <label className="block"><span className={dLabel}><Calendar className="mr-1 inline h-3 w-3" />Start date & time</span>
                <input required type="datetime-local" className={dField} value={toLocal(ev.startsAt)} onChange={(x) => x.target.value && setEv({ ...ev, startsAt: new Date(x.target.value).toISOString() })} /></label>
              <label className="block"><span className={dLabel}>Description</span>
                <textarea rows={3} className={dField} placeholder="Tell people a little more about your event." value={ev.description} onChange={(x) => setEv({ ...ev, description: x.target.value })} /></label>
              <label className="block"><span className={dLabel}>Cover image URL</span>
                <input className={dField} type="url" placeholder="https://..." value={ev.image} onChange={(x) => setEv({ ...ev, image: x.target.value })} /></label>
            </div>
            <div className="flex justify-end gap-3 bg-discord-input p-4">
              <button type="button" onClick={() => setEv(null)} className="px-4 py-2 text-sm hover:underline">Cancel</button>
              <button className="rounded-sm bg-discord px-5 py-2 text-sm font-semibold hover:brightness-110">{ev.id ? "Save changes" : "Create Event"}</button>
            </div>
          </form>
        </Modal>
      )}

      {cup && (
        <Modal onClose={() => setCup(null)}>
          <form className="w-full max-w-md space-y-4 rounded-lg border bg-card p-6"
            onSubmit={(f) => { f.preventDefault(); store.saveCup(cup); setCup(null); }}>
            <h3 className="flex items-center gap-2 font-display text-xl font-bold text-primary"><Trophy className="h-5 w-5" />{cup.id ? "Edit Cup" : "New Cup"}</h3>
            <input required className={field} placeholder="Cup name" value={cup.name} onChange={(x) => setCup({ ...cup, name: x.target.value })} />
            <input required className={field} placeholder="Gamemode" value={cup.gamemode} onChange={(x) => setCup({ ...cup, gamemode: x.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-muted-foreground">ELO reward<input type="number" min={0} className={field} value={cup.eloReward} onChange={(x) => setCup({ ...cup, eloReward: +x.target.value })} /></label>
              <label className="text-sm text-muted-foreground">Slots<input type="number" min={2} className={field} value={cup.slots} onChange={(x) => setCup({ ...cup, slots: +x.target.value })} /></label>
            </div>
            <input required type="datetime-local" className={field} value={toLocal(cup.startsAt)} onChange={(x) => x.target.value && setCup({ ...cup, startsAt: new Date(x.target.value).toISOString() })} />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setCup(null)} className="px-4 py-2 text-sm">Cancel</button>
              <button className="rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground">Save</button>
            </div>
          </form>
        </Modal>
      )}
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
