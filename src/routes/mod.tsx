import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Download, FileDown, Puzzle } from "lucide-react";
import { PageTitle, SiteHeader } from "@/components/SiteHeader";
import { ModSetupGuide } from "@/components/ModSetupGuide";
import { modDownloadUrl, modFilesQuery, siteContentQuery, type ModFile } from "@/lib/klober";
import {
  DEFAULT_MOD_GUIDE,
  MOD_GUIDE_KEY,
  latestModFiles,
  normalizeModGuide,
} from "@/lib/mod-release";

export const Route = createFileRoute("/mod")({
  head: () => ({
    meta: [
      { title: "ELO Mod — Klober Tiers" },
      {
        name: "description",
        content:
          "Download Klober Tiers ELO v0.4.0 Kit Fix for Minecraft 1.21.11, 26.1, 26.2 and 26.3, with installation instructions.",
      },
      { property: "og:title", content: "ELO Mod — Klober Tiers" },
      {
        property: "og:description",
        content: "Download the latest Klober Tiers ELO mod and follow the setup guide.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ModPage,
});

export function ModPage() {
  const { data: text } = useQuery(siteContentQuery(MOD_GUIDE_KEY));
  const { data: uploaded = [], isError } = useQuery(modFilesQuery);
  const files = latestModFiles(uploaded);
  const guide = normalizeModGuide(text) || DEFAULT_MOD_GUIDE;
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
        <PageTitle title="ELO Mod" sub="Track your kills and earn ELO automatically." />
        <section className="mt-8" aria-labelledby="mod-downloads">
          <h2
            id="mod-downloads"
            className="flex items-center gap-3 font-display text-2xl font-bold text-primary"
          >
            <FileDown aria-hidden="true" /> Downloads
          </h2>
          <div className="mt-4 rounded-lg border border-primary/30 bg-card p-5">
            <p className="font-bold text-primary">v0.4.0 Kit Fix</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Four builds compiled on 30 October 2026. Includes fuller kit detection and automatic
              player registration when the server is configured. Choose the JAR for your exact
              Minecraft version.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Compilation and logic checks passed. Gameplay testing is still needed.
            </p>
          </div>
          <div className="mt-4 space-y-3">
            {files.map((file) => (
              <FileRow key={file.id} file={file} />
            ))}
          </div>
          {isError && (
            <p className="mt-3 text-sm text-muted-foreground">
              Additional uploads could not be checked. The verified v0.4.0 downloads above are still
              available.
            </p>
          )}
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Install only one Klober Tiers JAR, with Fabric Loader 0.20.1 or newer and Fabric API for
            the same Minecraft version.{" "}
            <a
              href="/mods/0.4.0/SHA256SUMS.txt"
              className="text-primary underline underline-offset-4"
            >
              v0.4.0 checksums
            </a>
          </p>
        </section>
        <section className="mt-10" aria-labelledby="mod-setup">
          <h2
            id="mod-setup"
            className="flex items-center gap-3 font-display text-2xl font-bold text-primary"
          >
            <Puzzle aria-hidden="true" /> Setup Guide
          </h2>
          <div className="mt-4 rounded-lg border bg-card p-5 sm:p-7">
            <ModSetupGuide text={guide} />
          </div>
        </section>
      </main>
    </div>
  );
}

export function FileRow({ file }: { file: ModFile }) {
  const direct = file.path.startsWith("/mods/");
  const [url, setUrl] = useState<string | null>(direct ? file.path : null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setFailed(false);
    setUrl(direct ? file.path : null);
    if (!direct)
      modDownloadUrl(file.path, file.name)
        .then((value) => {
          if (active) setUrl(value);
        })
        .catch(() => {
          if (active) setFailed(true);
        });
    return () => {
      active = false;
    };
  }, [direct, file.path, file.name, retry]);
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card p-4">
      <div className="min-w-0 flex-1 basis-56">
        <div className="break-words font-bold">{file.label || file.name}</div>
        <div className="mt-1 text-sm text-muted-foreground">
          Minecraft {file.mc_version} · {(file.size / 1024).toFixed(1)} KB
        </div>
        <div className="mt-1 break-all font-mono text-xs text-muted-foreground">{file.name}</div>
      </div>
      {url ? (
        <a
          href={url}
          download={file.name}
          aria-label={"Download for Minecraft " + file.mc_version}
          className="flex shrink-0 items-center gap-2 rounded-md bg-gold-gradient px-4 py-2 font-semibold text-primary-foreground hover:brightness-110"
        >
          <Download className="h-4 w-4" aria-hidden="true" /> Download
        </a>
      ) : failed ? (
        <button
          onClick={() => setRetry((value) => value + 1)}
          className="rounded-md border px-4 py-2 text-sm text-primary"
        >
          Retry download
        </button>
      ) : (
        <span
          role="status"
          className="shrink-0 rounded-md border px-4 py-2 text-sm text-muted-foreground"
        >
          Preparing download…
        </span>
      )}
    </div>
  );
}
