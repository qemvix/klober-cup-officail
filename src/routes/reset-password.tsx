import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset admin password — Klober Tiers" },
      { name: "description", content: "Choose a new Klober Tiers admin password." },
      { property: "og:title", content: "Reset admin password — Klober Tiers" },
      { property: "og:description", content: "Choose a new admin password." },
    ],
  }),
  ssr: false,
  component: Reset,
});

function Reset() {
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const nav = useNavigate();
  return (
    <div>
      <SiteHeader />
      <main className="px-6 py-12">
        <form className="mx-auto max-w-sm space-y-4 rounded-lg border bg-card p-6" onSubmit={async (e) => {
          e.preventDefault();
          const { error } = await supabase.auth.updateUser({ password: pw });
          if (error) return setMsg(error.message);
          nav({ to: "/admin" });
        }}>
          <h1 className="font-display text-2xl font-bold text-primary">New admin password</h1>
          <input className="w-full rounded-md border bg-background px-3 py-2" type="password" minLength={6} required placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} />
          <button className="w-full rounded-md bg-gold-gradient py-2 font-bold text-primary-foreground">Save password</button>
          {msg && <p className="text-sm text-destructive">{msg}</p>}
        </form>
      </main>
    </div>
  );
}
