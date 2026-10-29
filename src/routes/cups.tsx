import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { CupsSection } from "@/components/Sections";
import { cupsQuery } from "@/lib/klober";

export const Route = createFileRoute("/cups")({
  head: () => ({
    meta: [
      { title: "ELO Cups — Klober Tiers" },
      { name: "description", content: "Upcoming Klober Tiers ELO cups you can compete in." },
      { property: "og:title", content: "ELO Cups — Klober Tiers" },
      { property: "og:description", content: "Compete in cups to earn ELO." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(cupsQuery),
  component: () => (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12"><CupsSection /></main>
    </div>
  ),
});
