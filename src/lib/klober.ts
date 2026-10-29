import { useEffect, useState, useSyncExternalStore } from "react";

export type Player = { name: string; tier: "Emerald" | "Gold" | "Iron"; elo: number };
export const PLAYERS: Player[] = [
  { name: "Hasty0_0", tier: "Emerald", elo: 1868 },
  { name: "Spl_tt", tier: "Emerald", elo: 1842 },
  { name: "qemvix", tier: "Emerald", elo: 1745 },
  { name: "qnoodles", tier: "Gold", elo: 1322 },
  { name: "untitledducky", tier: "Iron", elo: 1199 },
  { name: "acethew", tier: "Iron", elo: 1165 },
  { name: "cl1pp3d08", tier: "Iron", elo: 1023 },
  { name: "synnlmao", tier: "Iron", elo: 987 },
];
export const avatar = (n: string, s = 64) => `https://mc-heads.net/avatar/${n}/${s}`;

export type Cup = { id: string; name: string; gamemode: string; eloReward: number; slots: number; startsAt: string };
export type KEvent = {
  id: string; title: string; description: string; server: string; channel: string;
  invite: string; startsAt: string; image: string;
};
type State = { cups: Cup[]; events: KEvent[] };

const KEY = "klober-store-v1";
const inDays = (d: number, h = 18) => {
  const t = new Date(); t.setDate(t.getDate() + d); t.setHours(h, 0, 0, 0); return t.toISOString();
};
const DEFAULT: State = {
  cups: [
    { id: "c1", name: "Sword Showdown Cup", gamemode: "Sword", eloReward: 50, slots: 16, startsAt: inDays(2) },
    { id: "c2", name: "Nethpot Clash", gamemode: "Nethpot", eloReward: 35, slots: 32, startsAt: inDays(5) },
  ],
  events: [
    { id: "e1", title: "Klober Friday Fights", description: "Weekly open bracket — all tiers welcome.", server: "Klober Tiers", channel: "event-stage", invite: "", startsAt: inDays(1, 20), image: "" },
  ],
};

let state: State = DEFAULT;
let loaded = false;
const subs = new Set<() => void>();
function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { const raw = localStorage.getItem(KEY); if (raw) state = JSON.parse(raw); } catch { /* ignore */ }
}
function set(next: State) {
  state = next;
  localStorage.setItem(KEY, JSON.stringify(state));
  subs.forEach((f) => f());
}
const subscribe = (f: () => void) => { load(); subs.add(f); f(); return () => subs.delete(f); };

export function useStore() {
  const s = useSyncExternalStore(subscribe, () => { load(); return state; }, () => DEFAULT);
  const uid = () => Math.random().toString(36).slice(2, 10);
  return {
    ...s,
    saveCup: (c: Omit<Cup, "id"> & { id?: string }) =>
      set({ ...state, cups: c.id ? state.cups.map((x) => (x.id === c.id ? (c as Cup) : x)) : [...state.cups, { ...c, id: uid() }] }),
    deleteCup: (id: string) => set({ ...state, cups: state.cups.filter((x) => x.id !== id) }),
    saveEvent: (e: Omit<KEvent, "id"> & { id?: string }) =>
      set({ ...state, events: e.id ? state.events.map((x) => (x.id === e.id ? (e as KEvent) : x)) : [...state.events, { ...e, id: uid() }] }),
    deleteEvent: (id: string) => set({ ...state, events: state.events.filter((x) => x.id !== id) }),
  };
}

export function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);
  return now;
}

export function countdown(target: string, now: number) {
  const ms = new Date(target).getTime() - now;
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}
