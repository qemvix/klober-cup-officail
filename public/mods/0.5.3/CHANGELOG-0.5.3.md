# Klober Tiers ELO 0.5.3 — Themes & Server Transfers

## Menu and font
- Minecraft’s normal font is now the default for menus, HUD text, ELO popups and ELO label numbers, including when upgrading an older config. SF Pro remains selectable in Menu style > Style.
- Kept the WalksyLib-inspired sidebar, rounded grouped settings, right-aligned switches/sliders, hover/click feedback and opening animation.
- Added Menu style, with Style, Colours and Themes sections.
- Added a menu background opacity slider, independent of HUD opacity. At zero, menu surfaces disappear while labels and interactive handles remain readable.
- Added a separate world-backdrop dim slider.
- Added live colour pickers for menu accent, text, background, content panels and sidebar. The picker previews menu colours.
- Added Gold, Ice, Violet, Mint and Mono presets. They recolour the menu, HUD and ELO label text while preserving opacity, font, HUD position/size, nametag geometry/visibility and tracking settings.
- Custom colour edits mark the theme Custom. Selected presets and appearance settings are saved.
- Added Reset menu. It restores menu colours, font, opacity and backdrop dim without changing the token, tracking, HUD placement or nametag visibility. HUD and nametags retain separate resets.

## ELO nametags
- Added a direct Hide ELO labels / Show ELO labels button in Nametags. This hides only the added ELO lines; normal Minecraft player names are untouched.
- Kept average/current-mode components, icons, weight, colour, position, size, distance, stacked layout and separator controls.
- Fixed the hide/show button getting out of sync when the separate ELO nametags switch is used.
- Minecraft label text supports normal and bold weights; SF Pro keeps Regular, Medium and Bold.

## FlowPvP / PvPHQ and duel transfers
- Added pvphq.com and its subdomains, including play.pvphq.com, alongside flowpvp.gg and its subdomains. Both map to the existing flowpvp.gg backend family, preserving scoring rules and victim caps.
- World and connection changes clear the old detected kit and current rating, even when the server family stays the same.
- Loading/transfer periods pause submissions. The new inventory must pass the existing stable-kit check before events resume.
- A brief same-family transfer preserves the consecutive-death run when the confirmed mode stays the same. A changed mode, different server family, real disconnect or extended loading timeout resets the run.
- Old-world events are blocked even if they arrive before the next client tick.
- Late ELO responses from an earlier connection cannot overwrite the current HUD rating, status or popup. Confirmed queued events can still appear in session history.
- Address parsing rejects malformed ports and lookalike/suffix-spoof hosts.

## Other bug fixes and QoL
- Fixed the old death latch carrying over after a mode change and potentially swallowing the first death in the new mode.
- Prevented a recent kit from attributing a death to the previous mode while a different kit is being confirmed.
- Unrelated server announcements no longer display Kill ignored while kit detection is pending.
- The HUD distinguishes Waiting for kit from Tracking, Paused and unsupported/loading states.
- Failed roster lookups retry after about five seconds instead of waiting a full minute.
- A malformed config is backed up as klober-tiers.invalid-<timestamp>.json before defaults are written. If the backup fails, saving is blocked to protect the original token/settings.
- Opt-in debug logs rotate after roughly 256 KiB, keeping one previous file.
- Updated website downloads and formatted instructions for this release.

## Scoring retained
Listed kill +10; unlisted kill +5. Your second consecutive death in the same mode costs 1 ELO once per streak. Further deaths in that streak cost nothing; a kill or mode change resets it. Your own death is never a kill. Unknown kits and spectators do not submit ELO events. Rank progress remains on hold.

## Install
Remove the older Klober Tiers JAR from the profile. Install only the 0.5.3 JAR matching your exact Minecraft version, with matching Fabric API. Your token/settings stay in config/klober-tiers.json. Do not install the source ZIP as a mod.
Press K > Menu style for fonts, themes and menu opacity. Use Nametags > Hide ELO labels to hide added lines. HUD > Glass controls the counter separately; HUD > Layout > Drag HUD in game moves it.

## Validation and limits
All four targets (1.21.11, 26.1, 26.2, 26.3) built successfully with JDK 25. The 1.21.11 build targets Java 21 bytecode; 26.x targets Java 25. Parser, death-message, kit, scoring-state, alias/transfer and appearance regressions pass. Config migration/backup and headless UI interaction checks pass. Menu previews render the actual UI source with Minecraft bitmap assets or bundled SF Pro files and sample ratings.
Live FlowPvP/PvPHQ duel transfers, exact live server messages and Lunar Client rendering have not been gameplay-tested. These fixes address the missing alias and stale-world state; every live server/client combination is not yet verified.
No new database migration or rating reset is required.

## Big update ideas — not implemented
- Match recaps with mode, kills/deaths, confirmed ELO changes and a local session timeline.
- Optional appearance profiles per gamemode, plus appearance-only import/export.
- A server diagnostics panel showing recognized address, transfer state and kit confidence.
- Optional notification sounds and an in-menu update/changelog viewer.
Rank progress stays deferred as requested.
