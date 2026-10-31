import { z } from "zod";
import { MODES } from "@/lib/ranking";

export const deathEventSchema = z
  .object({
    eventId: z.string().uuid(),
    runId: z.string().uuid(),
    serverId: z.enum(["mcpvp.com", "mcpvp.club", "minemen.club", "flowpvp.gg"]),
    gamemode: z.string().refine((v) => MODES.some((m) => m.slug === v)),
    playerName: z.string().regex(/^[A-Za-z0-9_]{1,16}$/),
    occurredAt: z.string().datetime({ offset: true }),
  })
  .strict();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export async function handleDeathEvent(request: Request) {
  const token = process.env["ELO_INGEST_TOKEN"];
  if (!token) return json({ error: "ELO ingestion is not configured." }, 503);
  if (request.headers.get("authorization") !== `Bearer ${token}`)
    return json({ error: "Unauthorized." }, 401);
  const url = process.env["SUPABASE_URL"]?.replace(/\/+$/, "");
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return json({ error: "ELO database is not configured." }, 503);
  if (Number(request.headers.get("content-length") ?? 0) > 4096)
    return json({ error: "Request too large." }, 413);
  let text: string;
  try {
    text = await request.text();
  } catch {
    return json({ error: "Invalid body." }, 400);
  }
  if (text.length > 4096) return json({ error: "Request too large." }, 413);
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }
  const parsed = deathEventSchema.safeParse(body);
  if (!parsed.success || Date.parse(parsed.data.occurredAt) > Date.now() + 300000)
    return json({ error: "Invalid death event." }, 400);
  const event = parsed.data;
  try {
    const rpc = await fetch(`${url}/rest/v1/rpc/record_elo_self_death_with_token`, {
      method: "POST",
      headers: { apikey: key, "content-type": "application/json" },
      body: JSON.stringify({
        p_ingest_token: token,
        p_event_id: event.eventId,
        p_run_id: event.runId,
        p_server_id: event.serverId,
        p_gamemode: event.gamemode,
        p_player_name: event.playerName,
        p_occurred_at: event.occurredAt,
      }),
      signal: AbortSignal.timeout(10000),
    });
    const result = await rpc.json().catch(() => null);
    if (!rpc.ok) {
      const code = result && typeof result.code === "string" ? result.code : "unknown";
      console.error("[elo-death] RPC failed", rpc.status, code);
      return json(
        {
          error: code === "P0002" ? "Player must be registered first." : "Unable to record death.",
        },
        code === "P0002" || code === "22023" ? 422 : 503,
      );
    }
    return json(result);
  } catch {
    return json({ error: "Death reporting temporarily unavailable." }, 502);
  }
}
