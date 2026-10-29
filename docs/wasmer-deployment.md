# Deploy Klober Tiers to Wasmer Edge

This repository uses TanStack Start with Nitro and Bun. The root `Anybuild` file configures the Wasmer build to use Nitro's Node server output.

## Connect GitHub

1. Connect `qemvix/klober-cup-officail` to Wasmer Edge.
2. Select `main` as the production branch.
3. Configure the custom domain and wait for TLS provisioning.

## Runtime environment variables for ELO

For a Lovable Cloud backend, configure these in Wasmer's app settings and redeploy:

- `ELO_INGEST_TOKEN`: a random token of at least 32 characters, also stored in `private.elo_ingest_config` and used by the game-server/mod. Keep it server-side in Wasmer; never prefix it with `VITE_`.
- `SUPABASE_URL`: same public backend URL used by `VITE_SUPABASE_URL`.
- `SUPABASE_PUBLISHABLE_KEY`: same public key used by `VITE_SUPABASE_PUBLISHABLE_KEY`.

Lovable Cloud does not expose a service-role key or direct database connection string for external use, so this integration uses a token-protected SQL RPC wrapper instead. The URL and publishable key are public client configuration. Do not create or guess a service-role key.

## Database and first launch

1. Apply `drizzle/migrations/0001_elo_abuse_protection.sql` if not already applied.
2. Apply `drizzle/migrations/0002_lovable_cloud_rpc_bridge.sql` to the same Lovable Cloud database.
3. Insert the same random token into `private.elo_ingest_config` and Wasmer's `ELO_INGEST_TOKEN` environment variable.
4. Confirm the endpoint returns `503` when configuration is missing and `401` for an incorrect bearer token. Then test a valid event for an existing roster player.
5. Configure the Minecraft mod/server to send unique UUID events to `POST /api/elo-event`. All supported servers must use the same endpoint so the daily cap is global.

The Minecraft mod/server integration is a separate deliverable; the website endpoint does not detect kills by itself.
