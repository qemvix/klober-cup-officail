import { createFileRoute } from "@tanstack/react-router";
import { handleDeathEvent } from "@/lib/death-event";

export const Route = createFileRoute("/api/elo-death")({
  server: { handlers: { POST: ({ request }) => handleDeathEvent(request) } },
});
