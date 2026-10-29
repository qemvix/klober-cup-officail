import { queryOptions } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Player = Omit<Tables<"players">, "elo"> & { elo: Record<string, number> };
export type Cup = Tables<"cups">;
export type KEvent = Tables<"events">;

export const avatar = (p: { name: string; skin?: string | null }, s = 64) =>
  `https://mc-heads.net/avatar/${p.skin || p.name}/${s}`;
export const body = (p: { name: string; skin?: string | null }, s = 180) =>
  `https://mc-heads.net/body/${p.skin || p.name}/${s}`;

export const playersQuery = queryOptions({
  queryKey: ["players"],
  queryFn: async () => {
    const { data, error } = await supabase.from("players").select("*").order("name");
    if (error) throw error;
    return (data ?? []) as Player[];
  },
});
export const cupsQuery = queryOptions({
  queryKey: ["cups"],
  queryFn: async () => {
    const { data, error } = await supabase.from("cups").select("*").order("starts_at");
    if (error) throw error;
    return data ?? [];
  },
});
export const eventsQuery = queryOptions({
  queryKey: ["events"],
  queryFn: async () => {
    const { data, error } = await supabase.from("events").select("*").order("starts_at");
    if (error) throw error;
    return data ?? [];
  },
});

export function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  return now;
}

export function countdown(target: string, now: number) {
  const ms = new Date(target).getTime() - now;
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export const fmtDate = (d: string) => new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
