# Klober Tiers: 15 ELO modes (website + Fabric mod)

Website mode IDs (must match Java mod, bot and Lovable Cloud SQL):
`diamond-smp`, `lt-cart`, `ht-cart`, `creeper`, `uhc`, `sword`, `smp`, `axe`, `mace`, `nethpot`, `crystal`, `pot`, `elytra-mace`, `spear-mace`, `trident`.

## Apply database migration before accepting new-mode events

**Important:** Committing code to GitHub does not run SQL in Lovable Cloud.

1. Open your Lovable Cloud project > Database > SQL Editor.
2. Open `drizzle/migrations/0003_add_expanded_gamemodes.sql` from this repository.
3. Paste and execute it **once**. It updates the existing ELO event gamemode CHECK, expands the supported-mode guard in `record_elo_kill`, and adds missing 1000-ELO JSONB fields without overwriting existing scores.
4. Check that `public.players.elo` contains the five new keys.
5. Deploy the website on Wasmer, and install the corresponding 0.4.0 mod after Windows builds.

Existing ELO rules (10/1 per kill, global 20-victim-deaths/day cap, penalties, server ingestion token) are unchanged.

**Overall ELO changes:** average ELO is now calculated across **all 15** modes. Each new mode starts at 1000. Existing players' average ELO and automatic tier can therefore change when the website deploys.

## Mode detection rules in the mod

- **Crystal**: respawn anchor is required. End crystals alone do not count.
- **Pot**: diamond armour plus actual instant-healing and regeneration potion contents (read from Minecraft's item data), not generic splash potion names.
- **Elytra Mace**: mace + firework rockets; this takes priority over regular mace.
- **Spear Mace**: mace + spear; this takes priority over regular mace.
- **Trident**: trident item.
- **SMP**: existing netherite SMP rules retained.
- If both special mace markers appear together, detection is blocked until the kit is unambiguous.
- Ambiguous LT Cart / HT Cart loadouts still use per-server K-menu kit learning.

## Nametag overlay

The mod fetches `public.players` from the public roster API every 60 seconds on supported PvP servers. Next to listed players it renders **average ELO** and a `#1` marker for every mode where they are within 25 ELO of the mode leader (matching the site's tied-rank rule). Unplayed modes with a maximum score of 1000 don't get a meaningless `#1` badge. Compact readable mode symbols/abbreviations are used in-game because emoji glyph support varies among Minecraft font packs. This is client-side; only people running the mod see the labels.

The first 0.4.0 build needs in-game verification on all four Minecraft versions; source-level smoke tests do not prove Fabric rendering compatibility.
