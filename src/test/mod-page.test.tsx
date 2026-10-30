import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ModSetupGuide } from "@/components/ModSetupGuide";
import {
  BUNDLED_MOD_FILES,
  DEFAULT_MOD_GUIDE,
  latestModFiles,
  normalizeModGuide,
} from "@/lib/mod-release";
import { ModPage } from "@/routes/mod";

vi.mock("@/components/SiteHeader", () => ({
  SiteHeader: () => null,
  PageTitle: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

describe("Mod release downloads", () => {
  it("replaces old uploads with the four verified release JARs", () => {
    const old = {
      ...BUNDLED_MOD_FILES[0]!,
      id: "old-upload",
      path: "old.jar",
      created_at: "2026-10-29T00:00:00Z",
    };
    const files = latestModFiles([old]);
    expect(files).toHaveLength(4);
    expect(files.map((file) => file.mc_version)).toEqual(["26.3", "26.2", "26.1", "1.21.11"]);
    expect(files.every((file) => file.path.startsWith("/mods/0.4.0/"))).toBe(true);
  });

  it("lets a newer admin JAR replace one version without offering a source ZIP", () => {
    const next = {
      ...BUNDLED_MOD_FILES[0]!,
      id: "new-upload",
      name: "klober-next.jar",
      path: "next.jar",
      created_at: "2026-10-31T00:00:00Z",
    };
    const source = {
      ...next,
      id: "source-zip",
      name: "source.zip",
      created_at: "2026-11-01T00:00:00Z",
    };
    const files = latestModFiles([next, source]);
    expect(files).toHaveLength(4);
    expect(files.find((file) => file.mc_version === next.mc_version)?.id).toBe(next.id);
  });

  it("ships the exact verified binaries with matching sizes and checksums", () => {
    const checksums = readFileSync(resolve("public/mods/0.4.0/SHA256SUMS.txt"), "utf8");
    for (const file of BUNDLED_MOD_FILES) {
      const bytes = readFileSync(resolve("public", file.path.slice(1)));
      expect(bytes.length).toBe(file.size);
      expect(bytes.subarray(0, 2).toString()).toBe("PK");
      const hash = createHash("sha256").update(bytes).digest("hex").toUpperCase();
      expect(checksums).toContain(`${hash}  ${file.name}`);
    }
  });

  it("renders all four working download links and current instructions before hydration", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const html = renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <ModPage />
      </QueryClientProvider>,
    );
    for (const file of BUNDLED_MOD_FILES) {
      expect(html).toContain(`href="${file.path}"`);
      expect(html).toContain(`download="${file.name}"`);
    }
    expect(html).toContain("Kit Fix");
    expect(html).toContain("Learn Current Kit");
    expect(html).not.toContain("Preparing download");
    expect(html).not.toContain("Loading…");
    client.clear();
  });
});

describe("Mod setup guide formatting", () => {
  it("decodes repeated JSON saves while preserving Windows paths and real line breaks", () => {
    const plain = "## Install\n1. Open `%APPDATA%\\.minecraft\\mods`\n2. Save your config";
    expect(normalizeModGuide(JSON.stringify(JSON.stringify(plain)))).toBe(plain);
    expect(normalizeModGuide(plain)).toBe(plain);
  });

  it("renders real headings, numbered steps, bullets and code rather than escaped text", () => {
    const html = renderToStaticMarkup(<ModSetupGuide text={JSON.stringify(DEFAULT_MOD_GUIDE)} />);
    expect(html).toContain("<h3");
    expect(html).toContain("<ol");
    expect(html).toContain("<ul");
    expect(html).toContain("<code");
    expect(html).toContain("%APPDATA%\\.minecraft\\mods");
    expect(html).toContain("YOUR_TOKEN_FROM_THE_ADMIN");
    expect(html).not.toContain("\\n");
  });

  it("keeps guide HTML as text", () => {
    const html = renderToStaticMarkup(<ModSetupGuide text={'<img src=x onerror="alert(1)">'} />);
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });
});
