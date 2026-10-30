import type { ModFile } from "@/lib/klober";

export const MOD_VERSION = "0.4.0";
// Keep the current release guide separate from the old, repeatedly encoded guide.
export const MOD_GUIDE_KEY = "mod_setup_guide_0.4.0";
export const MOD_DOWNLOAD_PATH = "/mods/0.4.0-compact-nametags";
export const RELEASED_AT = "2026-10-30T20:15:11.413Z";
export const BUNDLED_MOD_FILES: ModFile[] = [
  {
    id: "bundled-0.4.0-compact-1.21.11",
    name: "klober-tiers-0.4.0-mc1.21.11.jar",
    label: "Klober Tiers ELO v0.4.0 · Compact Nametags",
    mc_version: "1.21.11",
    path: "/mods/0.4.0-compact-nametags/klober-tiers-0.4.0-mc1.21.11.jar",
    size: 57358,
    created_at: "2026-10-30T20:15:11.413Z",
  },
  {
    id: "bundled-0.4.0-compact-26.1",
    name: "klober-tiers-0.4.0-mc26.1.jar",
    label: "Klober Tiers ELO v0.4.0 · Compact Nametags",
    mc_version: "26.1",
    path: "/mods/0.4.0-compact-nametags/klober-tiers-0.4.0-mc26.1.jar",
    size: 57349,
    created_at: "2026-10-30T20:15:11.413Z",
  },
  {
    id: "bundled-0.4.0-compact-26.2",
    name: "klober-tiers-0.4.0-mc26.2.jar",
    label: "Klober Tiers ELO v0.4.0 · Compact Nametags",
    mc_version: "26.2",
    path: "/mods/0.4.0-compact-nametags/klober-tiers-0.4.0-mc26.2.jar",
    size: 57415,
    created_at: "2026-10-30T20:15:11.413Z",
  },
  {
    id: "bundled-0.4.0-compact-26.3",
    name: "klober-tiers-0.4.0-mc26.3.jar",
    label: "Klober Tiers ELO v0.4.0 · Compact Nametags",
    mc_version: "26.3",
    path: "/mods/0.4.0-compact-nametags/klober-tiers-0.4.0-mc26.3.jar",
    size: 57417,
    created_at: "2026-10-30T20:15:11.413Z",
  },
];

/** One current JAR per Minecraft version; newer admin uploads can supersede it. */
export function latestModFiles(uploaded: ModFile[]): ModFile[] {
  const latest = new Map<string, ModFile>();
  const candidates = [...uploaded, ...BUNDLED_MOD_FILES]
    .filter((file) => file.name.toLowerCase().endsWith(".jar"))
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  for (const file of candidates) {
    const version = file.mc_version.trim();
    if (version && !latest.has(version)) latest.set(version, file);
  }
  return [...latest.values()].sort((a, b) =>
    b.mc_version.localeCompare(a.mc_version, undefined, { numeric: true }),
  );
}

/** Undo older JSON-string saves without interpreting HTML or changing file paths. */
export function normalizeModGuide(value: unknown): string {
  let text = typeof value === "string" ? value : "";
  for (let i = 0; i < 5; i++) {
    try {
      const decoded: unknown = JSON.parse(text);
      if (typeof decoded !== "string" || decoded === text) break;
      text = decoded;
    } catch {
      break;
    }
  }
  return text.replace(/\r\n/g, "\n").trim();
}

export const DEFAULT_MOD_GUIDE =
  '## 1. Install the matching mod\n1. Check the Minecraft version in your launcher and download its JAR above. Install only one Klober Tiers JAR.\n2. Install Fabric Loader 0.20.1 or newer and Fabric API for that exact Minecraft version.\n3. Put the Klober Tiers JAR and Fabric API in your profile’s mods folder. For the default Windows profile, open `%APPDATA%\\.minecraft\\mods`.\n4. Launch the matching Fabric profile once, then close Minecraft to create the mod’s config file.\n\nMinecraft 1.21.11 needs Java 21 or newer. Minecraft 26.1, 26.2 and 26.3 need Java 25. These downloads are already compiled; you do not need Gradle or the source ZIP to install them.\n\n## 2. Set up your ELO token\n1. With Minecraft closed, open `%APPDATA%\\.minecraft\\config\\klober-tiers.json`. Custom launcher profiles may use a different game folder.\n2. Get the ELO token from your Klober Tiers administrator. Paste it into the existing `apiToken` field, keeping the quotation marks.\n3. Save the file and relaunch Minecraft. If the config file is missing, check that the correct Fabric profile loaded the mod.\n\nOnly replace the token value; keep your other settings. The field should look like:\n```json\n"apiToken": "YOUR_TOKEN_FROM_THE_ADMIN"\n```\n\n## 3. Track your active kit\n1. Join a supported server and load your full kit, including armor and offhand items.\n2. Press `K` to open the menu and turn Kill tracking ON.\n3. Wait for the mod to detect your kit. v0.4.0 checks most items in the loadout, rather than relying on a single item.\n4. If your server uses a different loadout, select the matching Kit to learn and click Learn Current Kit while the full kit is in your inventory.\n5. Check the corner ELO counter and the popup after a legitimate kill. Server death announcements such as a player dying or blowing themselves up count while you have a detected kit; your own death messages and spectator-mode messages do not.\n\nThe Kit to learn selector teaches a fingerprint; it does not manually override the active ELO gamemode. Unknown or ambiguous kits pause ELO submissions until detection is confident.\n\n## Compact nametags\nA small star shows the player’s average ELO across all 15 modes. One Minecraft item icon shows ELO for your detected match mode, with no gamemode text or rank badges. The mode follows your detected kit; other players’ full inventories are not visible to the client. If your kit is uncertain, only the average appears.\n\n## Supported servers\n- mcpvp.com\n- mcpvp.club\n- minemen.club\n- flowpvp.gg / PvPHQ\n\n## ELO and player registration\n- Kill a listed player: +10 ELO. Kill an unlisted player: +5 ELO.\n- A victim’s 21st and later deaths that UTC day award no ELO. The cap is shared across servers and gamemodes and resets at midnight UTC.\n- Every 10 consecutive deaths for a listed player deduct 10 ELO. ELO is tracked separately for each gamemode.\n- New mod users can be added automatically while tracking is on, with a valid token and the website’s registration backend configured.\n\n## If something is not working\n- No kit detected: check the full inventory and armor, then teach the correct kit if your server uses a different loadout.\n- No ELO update: check the token, supported server, tracking switch and detected kit. Server messages must be recognized, and the daily victim cap still applies.\n- Missing dependency or startup error: check that Minecraft, Fabric API and the downloaded JAR all match. Remove older Klober Tiers JARs from that same profile.\n- For a kill-message issue, enable Debug kill messages in the K menu and check `klober-tiers-debug.txt` in the config folder. Include your Minecraft version and server when reporting a problem.\n\nAll four v0.4.0 Compact Nametags builds compiled successfully with JDK 25 on 30 October 2026. Parser, kit and ranking logic tests passed. In-game visuals, server detection and live ELO behavior still need gameplay testing.';
