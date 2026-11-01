import type { ModFile } from "@/lib/klober";

export const MOD_VERSION = "0.5.2";
export const MOD_GUIDE_KEY = "mod_setup_guide_0.5.2";
export const MOD_DOWNLOAD_PATH = "/mods/0.5.2";
export const RELEASED_AT = "2026-11-01T18:11:58.436Z";
export const BUNDLED_MOD_FILES: ModFile[] = [
  {
    id: "bundled-0.5.2-1.21.11",
    name: "klober-tiers-0.5.2-mc1.21.11.jar",
    label: "Klober Tiers ELO v0.5.2 · Sidebar & Font Fix",
    mc_version: "1.21.11",
    path: "/mods/0.5.2/klober-tiers-0.5.2-mc1.21.11.jar",
    size: 538256,
    created_at: "2026-11-01T18:11:58.436Z",
  },
  {
    id: "bundled-0.5.2-26.1",
    name: "klober-tiers-0.5.2-mc26.1.jar",
    label: "Klober Tiers ELO v0.5.2 · Sidebar & Font Fix",
    mc_version: "26.1",
    path: "/mods/0.5.2/klober-tiers-0.5.2-mc26.1.jar",
    size: 538576,
    created_at: "2026-11-01T18:11:58.436Z",
  },
  {
    id: "bundled-0.5.2-26.2",
    name: "klober-tiers-0.5.2-mc26.2.jar",
    label: "Klober Tiers ELO v0.5.2 · Sidebar & Font Fix",
    mc_version: "26.2",
    path: "/mods/0.5.2/klober-tiers-0.5.2-mc26.2.jar",
    size: 538706,
    created_at: "2026-11-01T18:11:58.436Z",
  },
  {
    id: "bundled-0.5.2-26.3",
    name: "klober-tiers-0.5.2-mc26.3.jar",
    label: "Klober Tiers ELO v0.5.2 · Sidebar & Font Fix",
    mc_version: "26.3",
    path: "/mods/0.5.2/klober-tiers-0.5.2-mc26.3.jar",
    size: 538707,
    created_at: "2026-11-01T18:11:58.436Z",
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
  "## 0.5.2 — font and sidebar correction\nThe menu now uses scalable SF Pro fonts with the original letter metrics, replacing the bitmap approximation. Navigation is in a left sidebar, with grouped rows, gold switches and right-aligned sliders.\n\nNametags has Display, Position and Style sections. Size, height, visible distance and stacked line spacing are under Position. Everything else works as described below.\n\n## Appearance and features\n- All mod text uses SF Pro Display, including menus, HUD, ELO popups and nametag numbers.\n- My ELO lists all 15 gamemodes and your average. Refresh ratings reads the roster; it never changes the active kit.\n- HUD > Glass enables a translucent glass-style surface. Adjust Background opacity and Glass highlights separately. The effect uses tint and highlights, without world blur or refraction.\n- HUD > Colours opens a shade box and hue strip with presets. The picker previews changes live; Done returns to the same settings tab.\n- Nametags > Style controls colour, weight, layout and separator; Display controls visibility and icons; Position controls size, height, distance and spacing.\n- Overview > Reduce motion turns off entrance, hover/click and popup movement.\n- Panels, buttons and sliders have rounded edges; menu entrances and button interactions are animated.\n\n## 1. Install the matching mod\n1. Check your Minecraft version and download its v0.5.2 JAR above. Remove the older Klober Tiers JAR from that profile.\n2. Install Fabric Loader 0.20.1 or newer and Fabric API for that exact Minecraft version.\n3. Put the matching Klober Tiers JAR and Fabric API in the profile's mods folder. For the default Windows profile, open `%APPDATA%\\.minecraft\\mods`.\n4. Launch that Fabric profile once, then close Minecraft to create the config file.\n\nMinecraft 1.21.11 needs Java 21 or newer. Minecraft 26.1, 26.2 and 26.3 need Java 25. Download only the build matching your game; these JARs are already compiled.\n\n## 2. Set up your ELO token\n1. With Minecraft closed, open `%APPDATA%\\.minecraft\\config\\klober-tiers.json`. Custom launchers can use a different game folder.\n2. Get the token from your Klober Tiers administrator. Replace only the existing `apiToken` value, keeping its quotation marks and your other settings.\n3. Save the file, relaunch Minecraft, join a supported server and press `K`.\n\nThe token field looks like:\n```json\n\"apiToken\": \"YOUR_TOKEN_FROM_THE_ADMIN\"\n```\n\n## 3. Use the black and gold menu\n1. In Overview, turn Tracking ON. Load your full kit and wait for its detection status.\n2. Activity shows recent kills and deaths, the mode, confirmed ELO changes and the reason for +0 or failed reporting.\n3. Overview shows confirmed kills, observed deaths, session ELO, best kill streak, elapsed time and K:D. Reset session stats requires a second click and changes only the local dashboard.\n4. HUD controls the corner counter's size, opacity, horizontal and vertical position. Open HUD > Colours, choose Accent, Text or Background, then use the shade box, hue strip or a preset.\n5. Click Drag HUD in game, drag the counter anywhere on screen, then choose Done. Reset HUD appearance restores the counter; the Nametags tab has its own reset.\n\nSettings save automatically. The kit chooser and Learn Current Kit buttons have been removed. Automatic detection selects the ELO ladder; it never uses a manually chosen mode.\n\n## 4. Nametags\n- A star icon shows average ELO across all 15 modes. An item icon shows ELO in your currently detected match mode.\n- The ELO line is above the vanilla name. The Nametags tab controls its visibility, average/current-mode components, size, height and distance.\n- Other players' full inventories are not visible to the client, so the mode follows YOUR detected kit. Unknown kits show average only if enabled.\n\n## 5. Kit detection and scoring\n- Cart + crossbow + flint and steel identifies HT Cart before LT Cart, even if powered rails are present. Other built-in kit profiles remain available.\n- Kill a listed player: +10 ELO. Kill an unlisted player: +5 ELO. Server death announcements count with a detected kit; your own death is never a kill.\n- A victim's 21st and later recorded deaths that UTC day award no kill ELO across supported servers and modes.\n- Your second consecutive death in the SAME gamemode deducts 1 ELO. Further deaths in that streak cost nothing. A kill or a detected gamemode change resets the count. ELO changes apply in the mode of the death.\n- Self-death reports require v0.5.2 and the updated backend. A death report and your opponent's kill report cannot apply two penalties.\n- Spectator messages and unsupported servers do not produce ELO events. Unknown or ambiguous kits pause submissions.\n- New mod users can register automatically with tracking ON and a valid token. ELO rewards and penalties are confirmed by the website, never guessed by the HUD.\n\n## Supported servers\n- mcpvp.com\n- mcpvp.club\n- minemen.club\n- flowpvp.gg / PvPHQ\n\n## If something is not working\n- Kit not detected: check the full inventory and armor. Overview shows the nearest profile or missing-kit status. HT Cart specifically needs a cart, crossbow and flint and steel for its priority rule.\n- No ELO change: check the token, supported server, tracking switch, detected kit and Activity error. The victim cap still applies.\n- Startup error: check Minecraft, Fabric API and the JAR version match. Install only one Klober Tiers JAR.\n- For server-message issues, enable Debug messages in Overview and check `klober-tiers-debug.txt` in the config folder. Keep the token private.\n\nAll four v0.5.2 builds compiled with JDK 25. Gameplay logic, API validation, database scoring and menu layout checks passed. In-game visuals, Lunar Client compatibility and live match behavior still need gameplay testing.";
