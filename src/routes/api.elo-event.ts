import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { MODES } from "@/lib/ranking";

const schema = z.object({
  eventId: z.string().uuid(),
  serverId: z.string().trim().min(1).max(80),
  gamemode: z.string().refine((v) => MODES.some((m) => m.slug === v)),
  killerName: z.string().trim().regex(/^[A-Za-z0-9_]{1,16}$/),
  victimName: z.string().trim().regex(/^[A-Za-z0-9_]{1,16}$/),
  occurredAt: z.string().datetime({ offset: true }),
}).strict();

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { "content-type": "application/json; charset=utf-8" },
});

export const Route = createFileRoute("/api/elo-event")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env["ELO_INGEST_TOKEN"];
        if (!token) return response({ error: "ELO ingestion is not configured." }, 503);
        if (request.headers.get("authorization") !== `Bearer ${token}`) return response({ error: "Unauthorized." }, 401);
        const length = Number(request.headers.get("content-length") ?? 0);
        if (Number.isFinite(length) && length > 4096) return response({ error: "Request too large." }, 413);
        let body: unknown;
        try { body = await request.json(); } catch { return response({ error: "Invalid JSON." }, 400); }
        const parsed = schema.safeParse(body);
        if (!parsed.success) return response({ error: "Invalid event.", details: parsed.error.flatten() }, 400);
        const e = parsed.data;
        if (e.killerName.toLowerCase() === e.victimName.toLowerCase()) return response({ error: "Self-kills are not supported." }, 400);
        if (Date.parse(e.occurredAt) > Date.now() + 300000) return response({ error: "Event timestamp is in the future." }, 400);
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin.rpc("record_elo_kill", {
            p_event_id: e.eventId, p_server_id: e.serverId, p_gamemode: e.gamemode,
            p_killer_name: e.killerName, p_victim_name: e.victimName, p_occurred_at: e.occurredAt,
          });
          if (error) {
            console.error("[elo-event]", error.code, error.message);
            const status = error.code === "P0002" || error.code === "22023" ? 422 : 500;
            return response({ error: status === 422 ? error.message : "Unable to process event." }, status);
          }
          return response(data ?? { ok: true });
        } catch (error) {
          console.error("[elo-event] unavailable", error);
          return response({ error: "ELO ingestion unavailable." }, 500);
        }
      },
    },
  },
});
