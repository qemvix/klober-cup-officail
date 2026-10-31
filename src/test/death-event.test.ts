import { afterEach, describe, expect, it, vi } from "vitest";
import { handleDeathEvent } from "@/lib/death-event";

const event = {
  eventId: "00000000-0000-4000-8000-000000000001",
  runId: "00000000-0000-4000-8000-000000000002",
  serverId: "mcpvp.club",
  gamemode: "ht-cart",
  playerName: "Player",
  occurredAt: "2026-01-01T10:00:00Z",
};
const request = (body: unknown = event, authorization = "Bearer test-token") =>
  new Request("https://example.com/api/elo-death", {
    method: "POST",
    headers: { authorization, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
function env() {
  vi.stubEnv("ELO_INGEST_TOKEN", "test-token");
  vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "public-test");
}
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("self-death ingestion", () => {
  it("rejects unauthorized reports before querying the database", async () => {
    env();
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect((await handleDeathEvent(request(event, "Bearer wrong"))).status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("validates the server, run, mode, timestamp, name and body size", async () => {
    env();
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    for (const body of [
      { ...event, serverId: "evil.com" },
      { ...event, runId: "bad" },
      { ...event, gamemode: "bad" },
      { ...event, occurredAt: "2999-01-01T00:00:00Z" },
      { ...event, playerName: "bad name" },
      { ...event, extra: true },
    ]) {
      expect((await handleDeathEvent(request(body))).status).toBe(400);
    }
    expect((await handleDeathEvent(request("x".repeat(5000)))).status).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("passes the stable event and run IDs through and returns the confirmed penalty", async () => {
    env();
    const fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true, eloPenalty: 1, consecutiveDeaths: 2 })),
      );
    vi.stubGlobal("fetch", fetch);
    const result = await handleDeathEvent(request());
    expect(await result.json()).toMatchObject({ ok: true, eloPenalty: 1 });
    expect(JSON.parse(fetch.mock.calls[0]![1].body)).toMatchObject({
      p_event_id: event.eventId,
      p_run_id: event.runId,
      p_ingest_token: "test-token",
    });
  });
  it("reports duplicate acknowledgements without inventing another penalty", async () => {
    env();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, duplicate: true }))),
    );
    expect(await (await handleDeathEvent(request())).json()).toEqual({ ok: true, duplicate: true });
  });
  it("does not expose database errors or tokens in failures", async () => {
    env();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ code: "bad", message: "test-token" }), { status: 500 }),
        ),
    );
    const result = await handleDeathEvent(request());
    expect(result.status).toBe(503);
    expect(await result.text()).not.toContain("test-token");
  });
});
