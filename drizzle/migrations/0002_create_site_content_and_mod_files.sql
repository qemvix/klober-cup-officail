CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read site content" ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage site content" ON public.site_content FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.mod_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  label text NOT NULL DEFAULT '',
  mc_version text NOT NULL DEFAULT '',
  path text NOT NULL,
  size bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mod_files TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mod_files TO authenticated;
GRANT ALL ON public.mod_files TO service_role;
ALTER TABLE public.mod_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read mod files" ON public.mod_files FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage mod files" ON public.mod_files FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_content (key, value) VALUES
('mod_text', to_jsonb('🏆 KLOBER TIERS ELO MOD — SETUP
WSG everyone! 👋 This mod tracks Minecraft kills and submits ELO to our Klober Tiers website.

📥 INSTALLATION
Install Fabric Loader for your Minecraft version.
Install the matching Fabric API.
Download the correct Klober Tiers .jar for your Minecraft version.
Put the .jar in your mods folder.

Open your mods folder with Win + R:

%APPDATA%\.minecraft\mods

⚠️ Use the JAR matching your exact Minecraft version. Do NOT put the source ZIP in your mods folder.

Supported versions we''re building for:
• 1.21.11
• 26.1
• 26.2
• 26.3

I''ll share the JARs once the builds are verified!
🔑 TOKEN SETUP
Everyone whose kills should count needs to configure the shared token once.

Token:
S49uengnQ4XM1yQuVSZtVuAeBoRxW5vDckvsySXaacw


Launch Minecraft with the mod installed once, then close it.
Press Win + R.
Open:
%APPDATA%\.minecraft\config
Open klober-tiers.json in Notepad.
Find apiToken and enter the token above, keeping the quotation marks.
Save and relaunch Minecraft.
MAKE SURE TO SAVE IT {CTRL+S}
Make sure your game is closed when entering the token
If the file or setting doesn''t exist, ask me for help instead of making random settings.

⚠️ Keep the token inside our private group. Anyone with it may be able to submit fake ELO events.
🎮 HOW TO USE IT
Press K to open the mod menu.

• Toggle ELO tracking ON/OFF.
• Choose your gamemode.
• Check your ELO counter in the screen corner.
• Check the +ELO popup after kills.
• Use the website button to visit Klober Tiers.

🌐 SUPPORTED SERVERS
• mcpvp.com
• mcpvp.club
• minemen.club
• flowpvp.gg / PvPHQ

🥇 ELO RULES
• Kill someone on our tier list: +10 ELO
• Kill someone not on the list: +1 ELO
• Victim''s 21st+ death that UTC day: +0 ELO
• Every 10 consecutive deaths for a listed player: -10 ELO

ELO is separate per gamemode. The daily victim cap applies across all supported servers and modes, resetting at midnight UTC.

🧪 TESTING
Join a supported server.
Turn tracking ON.
Get a legitimate kill.
Check the popup, counter and website.

If something breaks, send me your Minecraft version, server and a screenshot of the error.

⚠️ This is an experimental mod. Kill detection and all four versions still need testing. Don''t spam test kills. 🏆'::text)),
('discord', jsonb_build_object('title', 'Join the Klober Tiers Discord', 'description', 'Chat with the community, get cup announcements and report mod issues.', 'invite', ''));