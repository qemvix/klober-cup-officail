# ELO event ingestion

The ELO board stores separate ratings per gamemode. This endpoint accepts kill events from your game-server mod/plugin and applies the rating rules on the website backend.

## Setup
1. Apply `drizzle/migrations/0001_elo_abuse_protection.sql` to the connected Supabase/Postgres database. Building the website does not apply SQL migrations automatically.
2. Configure `ELO_INGEST_TOKEN` as a server-only runtime secret in the website deployment and on each supported game server. Do not use a `VITE_*` variable for this secret.
3. Deploy the endpoint and point all supported game servers at the same website endpoint so the daily cap is shared.

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

Generate a unique UUID for each kill and reuse the same UUID when retrying that event. The killer must already exist in `public.players` so the system knows which gamemode rating to update. The victim may be absent from the roster. Gamemode must be one of the site's 10 slugs.

## Rules

- Killing a player with a row in `public.players` (the Klober Tiers roster) awards **+10 ELO** to the killer in that gamemode.
- Killing a player without a row in `public.players` awards **+1 ELO** to the killer in that gamemode.
- The first **20 deaths per victim per UTC calendar day** may award ELO. The 21st and later deaths still increment the victim's consecutive-death streak but award the killer 0 ELO. The count is global across server IDs and gamemodes.
- Every 10th consecutive death subtracts **10 ELO from a listed victim** in the gamemode of that death. Unlisted victims' streaks are still tracked, but no ELO penalty is applied when they have no roster entry.
- Any kill resets the killer's consecutive-death streak, even when the victim has reached the daily cap.
- The database stores event IDs uniquely and handles the event ledger write, streak updates, cap check, and rating changes in one transaction. Duplicate event IDs do not change ratings twice.

The SQL RPC is authoritative. `src/lib/elo-rules.ts` provides matching policy constants and unit-test coverage.
