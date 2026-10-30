import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Download, FileDown, Puzzle } from "lucide-react";
import { PageTitle, SiteHeader } from "@/components/SiteHeader";
import { modDownloadUrl, modFilesQuery, siteContentQuery, type ModFile } from "@/lib/klober";

export const Route = createFileRoute("/mod")({
  head: () => ({
    meta: [
      { title: "ELO Mod — Klober Tiers" },
      { name: "description", content: "Download the Klober Tiers ELO mod for Minecraft and learn how to set it up." },
      { property: "og:title", content: "ELO Mod — Klober Tiers" },
      { property: "og:description", content: "Download the Klober Tiers ELO mod and set it up." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ModPage,
});

function ModPage() {
  const { data: text } = useSuspenseQuery(siteContentQuery("mod_text"));
  const { data: files } = useSuspenseQuery(modFilesQuery);
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <PageTitle title="ELO Mod" sub="Track your kills and earn ELO automatically." />
        <section className="mt-8">
          <h2 className="flex items-center gap-3 font-display text-2xl font-bold text-primary"><FileDown /> Downloads</h2>
          <div className="mt-4 space-y-2">
            {files.length === 0 && <p className="text-muted-foreground">No mod files yet — check back soon.</p>}
            {files.map((f) => <FileRow key={f.id} file={f} />)}
          </div>
        </section>
        <section className="mt-10">
          <h2 className="flex items-center gap-3 font-display text-2xl font-bold text-primary"><Puzzle /> Setup Guide</h2>
          <div className="mt-4 whitespace-pre-wrap rounded-lg border bg-card p-6 font-mono text-sm leading-relaxed text-foreground/90">
            {typeof text === "string" ? text : "No setup guide yet."}
          </div>
        </section>
      </main>
    </div>
  );
}

function FileRow({ file }: { file: ModFile }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    modDownloadUrl(file.path, file.name).then(setUrl).catch(() => setUrl(null));
  }, [file.path, file.name]);
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-card p-4">
      <div>
        <div className="font-bold">{file.label || file.name}</div>
        <div className="text-sm text-muted-foreground">
          {file.mc_version && <>Minecraft {file.mc_version} · </>}
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </div>
      </div>
      {url ? (
        <a href={url} className="flex shrink-0 items-center gap-2 rounded-md bg-gold-gradient px-4 py-2 font-semibold text-primary-foreground hover:brightness-110">
          <Download className="h-4 w-4" /> Download
        </a>
      ) : (
        <span className="shrink-0 rounded-md border px-4 py-2 text-sm text-muted-foreground">Loading…</span>
      )}
    </div>
  );
}
