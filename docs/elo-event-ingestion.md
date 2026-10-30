# ELO event ingestion

The ELO board stores separate ratings per gamemode. This endpoint accepts kill events from the game-server mod/plugin and applies the rating rules through the existing database function.

## Lovable Cloud setup (no Lovable AI credits required)

1. Apply `drizzle/migrations/0002_lovable_cloud_rpc_bridge.sql` in the Lovable Cloud SQL editor. This creates a private config table and a token-protected RPC wrapper; it does not change player data.
2. Generate a random token of at least 32 characters. Store the exact same value in `private.elo_ingest_config.token`, Wasmer's runtime `ELO_INGEST_TOKEN`, and the game-server/mod configuration. Never commit it to GitHub or send it in chat.
3. In Wasmer, set runtime variables:
   - `ELO_INGEST_TOKEN`: the random token above.
   - `SUPABASE_URL`: the same backend URL used by the existing website's `VITE_SUPABASE_URL`.
   - `SUPABASE_PUBLISHABLE_KEY`: the same public key used by the existing website's `VITE_SUPABASE_PUBLISHABLE_KEY`.
   These last two are public client configuration, not service-role secrets. Do not set or invent a service-role key for Lovable Cloud; it is not exposed for managed projects.
4. Redeploy the Wasmer app after configuring variables.
5. Configure the game server/mod to send events to the Wasmer site's `POST /api/elo-event` endpoint with `Authorization: Bearer <ELO_INGEST_TOKEN>`.

### Configure the database token

After generating a strong token locally, run this query in Lovable Cloud's SQL editor, replacing the placeholder with that token (keep the single quotes):

```sql
insert into private.elo_ingest_config (id, token)
values (true, 'PASTE_THE_SAME_RANDOM_TOKEN_HERE')
on conflict (id) do update
set token = excluded.token, updated_at = now();
```

Do not paste the token into ChatGPT or commit it to the repository. Use a token at least 32 characters long.

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

Generate a unique UUID for each kill and reuse the same UUID when retrying that event. The killer must already exist in `public.players`; the victim may be absent from the roster. Gamemode must be one of the site's supported slugs.

## Rules

- Killing a player with a row in `public.players` awards **+10 ELO** to the killer in that gamemode.
- Killing a player without a row in `public.players` awards **+5 ELO** to the killer in that gamemode.
- The first **20 deaths per victim per UTC calendar day** may award ELO. The 21st and later deaths award 0 ELO. The count is global across server IDs and gamemodes.
- Every 10th consecutive death subtracts **10 ELO from a listed victim** in the gamemode of that death. Unlisted victims' streaks are tracked but have no ELO penalty.
- Any kill resets the killer's consecutive-death streak, even when the victim has reached the daily cap.
- Event IDs are unique, so retrying the same event does not award ELO twice.

## Security note

The token-protected database wrapper allows the public publishable key to be used without a service-role key. Treat the token as a bearer credential. A token embedded in a client-side Minecraft mod can be extracted, so this is suitable for a small private group but is not strong anti-cheat. For stronger integrity, use an authoritative server-side plugin that emits kill events.


## Unlisted reward update

Apply `drizzle/migrations/0005_unlisted_kill_reward_five.sql` in Lovable Cloud to change the installed database award from +1 to +5 for unlisted victims. Deploying the website or replacing a mod JAR alone does not change this database rule. The guarded update preserves the installed function and existing player ELO.
