import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { PageTitle, SiteHeader } from "@/components/SiteHeader";
import { siteContentQuery, type DiscordInfo } from "@/lib/klober";

export const Route = createFileRoute("/discord")({
  head: () => ({
    meta: [
      { title: "Discord — Klober Tiers" },
      { name: "description", content: "Join the Klober Tiers Discord server." },
      { property: "og:title", content: "Discord — Klober Tiers" },
      { property: "og:description", content: "Join the Klober Tiers Discord server." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DiscordPage,
});

function DiscordPage() {
  const { data } = useSuspenseQuery(siteContentQuery("discord"));
  const info = (data ?? { title: "Join the Klober Tiers Discord", description: "", invite: "" }) as DiscordInfo;
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <PageTitle title="Discord" />
        <div className="mt-8 overflow-hidden rounded-lg border-2 border-primary/50 bg-fn-gradient p-8 text-center">
          <MessageCircle className="mx-auto h-14 w-14 text-primary" />
          <h2 className="mt-4 font-display text-3xl font-black uppercase italic">{info.title}</h2>
          {info.description && <p className="mx-auto mt-3 max-w-md text-foreground/85">{info.description}</p>}
          {info.invite ? (
            <a href={info.invite} target="_blank" rel="noreferrer" className="fn-skew mt-6 inline-block bg-gold-gradient px-8 py-3 font-black uppercase text-primary-foreground hover:brightness-110">
              <span className="fn-unskew inline-block">Join Server</span>
            </a>
          ) : (
            <p className="mt-6 text-muted-foreground">Invite link coming soon.</p>
          )}
        </div>
      </main>
    </div>
  );
}
