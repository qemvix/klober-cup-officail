import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// The same ingestion token protects both registration and kill recording.
// A mod-only client cannot cryptographically prove the identity of the
// current Minecraft account, so only distribute this token to trusted users.
const requestSchema = z.object({
  playerName: z.string().regex(/^[A-Za-z0-9_]{1,16}$/),
  serverId: z.enum(["mcpvp.com", "mcpvp.club", "minemen.club", "flowpvp.gg"]),
}).strict();

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export const Route = createFileRoute("/api/elo-register")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env["ELO_INGEST_TOKEN"];
        if (!token) return json({ error: "ELO ingestion is not configured." }, 503);
        if (request.headers.get("authorization") !== `Bearer ${token}`) {
          return json({ error: "Unauthorized." }, 401);
        }

        const url = process.env["SUPABASE_URL"]?.replace(/\\/+$/, "");
        const apiKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!url || !apiKey) return json({ error: "Registration database is not configured." }, 503);

        if (Number(request.headers.get("content-length") ?? 0) > 2048) {
          return json({ error: "Request too large." }, 413);
        }

        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return json({ error: "Invalid JSON." }, 400);
        }

        const parsed = requestSchema.safeParse(payload);
        if (!parsed.success) return json({ error: "Invalid registration request." }, 400);

        try {
          const rpc = await fetch(`${url}/rest/v1/rpc/register_elo_player_with_token`, {
            method: "POST",
            headers: { apikey: apiKey, "content-type": "application/json", accept: "application/json" },
            body: JSON.stringify({
              p_ingest_token: token,
              p_server_id: parsed.data.serverId,
              p_player_name: parsed.data.playerName,
            }),
            signal: AbortSignal.timeout(10000),
          });
          const body: unknown = await rpc.json().catch(() => null);
          if (!rpc.ok) {
            const code = body && typeof body === "object" && "code" in body
              ? String(body.code) : "unknown";
            console.error("[elo-register] Database RPC failed", rpc.status, code);
            if (code === "22023") return json({ error: "Invalid player or server." }, 422);
            return json({ error: "Unable to register player. Apply migration 0004 in Lovable Cloud." }, 503);
          }
          return json(body ?? { ok: true });
        } catch {
          return json({ error: "Player registration temporarily unavailable." }, 502);
        }
      },
    },
  },
});
