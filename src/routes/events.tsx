import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { EventsSection } from "@/components/Sections";
import { eventsQuery } from "@/lib/klober";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — Klober Tiers" },
      { name: "description", content: "Upcoming Klober Tiers events with live countdowns." },
      { property: "og:title", content: "Events — Klober Tiers" },
      { property: "og:description", content: "Upcoming events and when they start." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(eventsQuery),
  component: () => (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12"><EventsSection /></main>
    </div>
  ),
});
