# Deploy Klober Tiers to Wasmer Edge

This repository uses TanStack Start with Nitro and Bun. The root `Anybuild` file configures the Wasmer build to use Nitro's Node server output and starts it with `node .output/server/index.mjs`.

## Connect GitHub

1. In Wasmer Edge, connect the GitHub repository `qemvix/klober-cup-officail`.
2. Select `main` as the production branch. Feature-branch pushes should remain previews/review changes; merging to `main` is the release trigger.
3. Let Wasmer build using the repository's root `Anybuild` file. It selects Node.js 24, Bun 1, and the TanStack Start + Nitro server.
4. Configure the app's custom domain in Wasmer's domain settings and wait for TLS provisioning.

## Required environment variables

Set runtime values in Wasmer's app Settings → Environment Vars. Never commit server secrets in `app.yaml`, `Anybuild`, or frontend variables.

- `SUPABASE_URL`: your Supabase project URL.
- `SUPABASE_PUBLISHABLE_KEY`: the public/publishable Supabase key used by server-side rendering.
- `SUPABASE_SERVICE_ROLE_KEY`: the Supabase service-role secret required by the ELO event endpoint. Server-side only; never prefix it with `VITE_`.
- `ELO_INGEST_TOKEN`: a long random token shared with the game-server mod/plugin. Server-side only; never prefix it with `VITE_`.

The frontend also needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` available during the build. These are public client settings, not secrets. They are currently represented by the project's existing public Supabase environment configuration; if you change them in Wasmer, make sure the values are available at build time and rebuild.

## Database and first launch

1. Apply `drizzle/migrations/0001_elo_abuse_protection.sql` to the same Supabase database used by the website. Deploying the site does not apply the SQL migration.
2. Confirm `POST /api/elo-event` returns `503` when the event token is not configured and `401` for a wrong token; after configuration, test with a valid event for existing roster players.
3. Connect the mod/plugin to the website endpoint and send a unique UUID per kill. All game servers must use the same endpoint so the 20-death daily cap is global.
4. Verify the leaderboard reflects per-gamemode updates, and test listed-victim +10, unlisted-victim +1, the 21st-death +0 cap, and every-10th-death penalty before announcing the site as live.

## Notes

- Wasmer Git deployments use the configured production branch; select `main` if you want merges to publish.
- Keep `ELO_INGEST_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY` in Wasmer's runtime secret settings, not in the repository.
- The Minecraft mod/client integration is a separate deliverable; the website endpoint alone does not detect kills by itself.
