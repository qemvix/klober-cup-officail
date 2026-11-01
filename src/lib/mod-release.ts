import type { ModFile } from "@/lib/klober";

export const MOD_VERSION = "0.5.3";
export const MOD_GUIDE_KEY = "mod_setup_guide_0.5.3";
export const MOD_DOWNLOAD_PATH = "/mods/0.5.3";
export const RELEASED_AT = "2026-11-01T19:05:52.548Z";
export const BUNDLED_MOD_FILES: ModFile[] = [
  {
    id: "bundled-0.5.3-1.21.11",
    name: "klober-tiers-0.5.3-mc1.21.11.jar",
    label: "Klober Tiers ELO v0.5.3 · Themes & Server Transfers",
    mc_version: "1.21.11",
    path: "/mods/0.5.3/klober-tiers-0.5.3-mc1.21.11.jar",
    size: 547949,
    created_at: "2026-11-01T19:05:52.548Z",
  },
  {
    id: "bundled-0.5.3-26.1",
    name: "klober-tiers-0.5.3-mc26.1.jar",
    label: "Klober Tiers ELO v0.5.3 · Themes & Server Transfers",
    mc_version: "26.1",
    path: "/mods/0.5.3/klober-tiers-0.5.3-mc26.1.jar",
    size: 547831,
    created_at: "2026-11-01T19:05:52.548Z",
  },
  {
    id: "bundled-0.5.3-26.2",
    name: "klober-tiers-0.5.3-mc26.2.jar",
    label: "Klober Tiers ELO v0.5.3 · Themes & Server Transfers",
    mc_version: "26.2",
    path: "/mods/0.5.3/klober-tiers-0.5.3-mc26.2.jar",
    size: 547968,
    created_at: "2026-11-01T19:05:52.548Z",
  },
  {
    id: "bundled-0.5.3-26.3",
    name: "klober-tiers-0.5.3-mc26.3.jar",
    label: "Klober Tiers ELO v0.5.3 · Themes & Server Transfers",
    mc_version: "26.3",
    path: "/mods/0.5.3/klober-tiers-0.5.3-mc26.3.jar",
    size: 547970,
    created_at: "2026-11-01T19:05:52.548Z",
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
  '## 0.5.3 — Themes & Server Transfers\nMinecraft’s normal font is now the default. The rounded sidebar remains, with SF Pro available in Menu style. This release adds menu opacity, menu colours, five themes, an ELO-label hide button and safer PvPHQ/FlowPvP transfers.\n\n## 1. Install the matching mod\n1. Download the v0.5.3 JAR for your exact Minecraft version. Remove older Klober Tiers JARs from that profile.\n2. Install Fabric Loader 0.20.1 or newer and Fabric API matching that Minecraft version.\n3. Put the matching JAR and Fabric API in the profile’s mods folder. The default Windows location is %APPDATA%\\.minecraft\\mods.\n4. Launch that Fabric profile once, then close Minecraft to create the config.\n\nMinecraft 1.21.11 needs Java 21 or newer. Minecraft 26.1, 26.2 and 26.3 need Java 25. These downloads are already compiled.\n\n## 2. Set up your ELO token\n1. With Minecraft closed, open %APPDATA%\\.minecraft\\config\\klober-tiers.json. Lunar and other launchers can use a different profile folder.\n2. Get the token from your Klober Tiers administrator. Replace only the existing apiToken value, keeping its quotation marks.\n3. Save, relaunch, join a supported server and press K. Enable Kill tracking in Overview.\n\n```json\n"apiToken": "YOUR_TOKEN_FROM_THE_ADMIN"\n```\n\nExisting tokens and settings are retained during upgrade. A malformed config is backed up before defaults are saved; inspect the backup to recover your token.\n\n## 3. Customise the menu\n- Menu style > Style: choose Minecraft or SF Pro; adjust Menu background opacity, World backdrop dim and Reduce motion.\n- Menu opacity changes background surfaces separately from text. HUD transparency is independent.\n- Menu style > Colours: choose accent, text, background, panels or sidebar with the live shade box and hue strip.\n- Menu style > Themes: apply Gold, Ice, Violet, Mint or Mono. Themes recolour menu, HUD and ELO labels while keeping font, opacity and positions.\n- Reset menu restores only menu appearance. Settings save automatically.\n\n## 4. HUD, ratings and activity\n- My ELO lists average ELO and all 15 gamemodes. Refresh ratings reads the roster without selecting a kit.\n- Activity lists recent kills/deaths and confirmed ELO results or reporting errors.\n- Overview shows session stats and kit status. Reset session stats needs two clicks and affects only the local dashboard.\n- HUD > Layout controls size, position and opacity. Click Drag HUD in game, drag the counter, then choose Done.\n- HUD > Glass adds translucent tint/highlights. It does not blur or refract the world.\n- HUD > Colours opens the picker. Reset HUD does not reset the menu.\n\n## 5. Nametags\n- Click Hide ELO labels in Nametags to hide only extra ELO lines. Normal Minecraft names stay visible. Show ELO labels restores them.\n- Display controls visibility, average, current mode and icons. Position controls size, height, range and stacked spacing. Style controls colour, weight, layout and separator.\n- A star represents average ELO; an item icon represents your currently detected match mode. Unknown kits show average only when enabled.\n- The client cannot see other players’ complete inventories. The mode follows YOUR detected kit.\n\n## 6. Detection and scoring\n- Load the complete kit and wait for detection. Unknown or ambiguous kits pause submissions; spectators do not submit.\n- Cart + crossbow + flint and steel prioritises HT Cart over LT Cart.\n- A listed kill gives +10 ELO; an unlisted kill gives +5. Your own death is never a kill.\n- The 21st and later recorded deaths of the same victim in a UTC day award no kill ELO across supported servers/modes.\n- Your second consecutive death in the same mode costs 1 ELO once per streak. Further deaths in that streak cost nothing. Kills or mode changes reset it.\n- Brief same-family transfers pause detection and recheck inventory. They retain the death run if the mode stays the same. A real disconnect or extended loading timeout resets it.\n- ELO changes require website confirmation. Missing roster entries can register with tracking enabled and a valid token.\n\n## Supported servers\n- mcpvp.com and subdomains\n- mcpvp.club and subdomains\n- minemen.club and subdomains\n- flowpvp.gg and subdomains\n- pvphq.com, including play.pvphq.com and subdomains, maps to the FlowPvP backend family\n\n## Troubleshooting\n- No kit: inspect full inventory and armour. Overview reports detection status. Transfers temporarily clear the old kit/rating.\n- No ELO: check tracking, token, supported address, detected kit and Activity errors. Daily caps still apply.\n- Startup failure: match Minecraft, Fabric API and JAR versions. Install only one Klober Tiers JAR.\n- Server messages: enable Debug messages in Overview. The config folder contains klober-tiers-debug.txt and one rotated log. Logs can contain usernames; keep the token private.\n\nAll four 0.5.3 versions compiled and passed local regression/layout checks. Live FlowPvP/PvPHQ duels and Lunar visuals still need a gameplay test.';
