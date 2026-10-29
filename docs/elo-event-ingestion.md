# ELO event ingestion

The public ELO board already stores a separate rating per gamemode. This branch adds the server-side event pipeline.

## Setup
1. Apply `drizzle/migrations/0001_elo_abuse_protection.sql` to the connected Supabase/Postgres database. Building the site does not apply SQL migrations automatically.
2. Configure `ELO_INGEST_TOKEN` as a server-only runtime secret in the website deployment and on each supported game server. Do not use a `VITE_*` variable.
3. Deploy the endpoint and point all game servers at the same website endpoint so the daily cap is shared.

## POST /api/elo-event
Headers: `Authorization: Bearer <ELO_INGEST_TOKEN>`, `Content-Type: application/json`

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "serverId": "survival-1",
  "gamemode": "sword",
  "killerName": "PlayerA",
  "victimName": "PlayerB",
  "occurredAt": "2026-10-29T12:34:56.789Z"
}
```

Use a unique UUID per kill and reuse it for retries. Player names must already exist in `public.players`. Gamemode must be one of the site's 10 slugs.

## Rules
- Each eligible kill awards +10 ELO to the killer in that gamemode.
- The first 20 deaths per victim per UTC calendar day may award ELO. The 21st and later deaths still increment the death streak but award no ELO. The count is global across server IDs and gamemodes.
- Every 10th consecutive death subtracts 10 ELO from the victim in the gamemode of that death. A kill resets the killer's consecutive-death streak even when the victim's cap has been reached.
- The database event UUID is unique; event insert, streak update, cap check, and rating changes are handled by one transaction.

The SQL RPC is authoritative. Keep `src/lib/elo-rules.ts` policy constants aligned with the SQL values.
