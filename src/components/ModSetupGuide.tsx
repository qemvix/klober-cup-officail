import type { ReactNode } from "react";
import { normalizeModGuide } from "@/lib/mod-release";

function inline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code
          key={index}
          className="break-all rounded bg-background px-1.5 py-0.5 font-mono text-xs text-primary"
        >
          {part.slice(1, -1)}
        </code>
      );
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    return part;
  });
}

/** Small, text-only Markdown renderer: never inserts guide content as HTML. */
export function ModSetupGuide({ text }: { text: string }) {
  const lines = normalizeModGuide(text).split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? "";
    const key = index;
    if (!line.trim()) {
      index++;
      continue;
    }
    if (line.startsWith("```")) {
      const code: string[] = [];
      index++;
      while (index < lines.length && !lines[index]?.startsWith("```"))
        code.push(lines[index++] ?? "");
      index++;
      blocks.push(
        <pre
          key={key}
          className="overflow-x-auto rounded-md border bg-background p-4 font-mono text-xs text-primary"
        >
          <code>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }
    const heading = /^#{1,3}\s+(.+)$/.exec(line);
    if (heading) {
      blocks.push(
        <h3 key={key} className="pt-3 font-display text-lg font-bold text-primary">
          {inline(heading[1] ?? "")}
        </h3>,
      );
      index++;
      continue;
    }
    if (/^\d+\.\s/.test(line) || /^[-*]\s/.test(line)) {
      const ordered = /^\d+\.\s/.test(line);
      const pattern = ordered ? /^\d+\.\s+/ : /^[-*]\s+/;
      const items: ReactNode[] = [];
      while (index < lines.length && pattern.test(lines[index] ?? "")) {
        items.push(<li key={index}>{inline((lines[index] ?? "").replace(pattern, ""))}</li>);
        index++;
      }
      blocks.push(
        ordered ? (
          <ol key={key} className="list-decimal space-y-2 pl-6">
            {items}
          </ol>
        ) : (
          <ul key={key} className="list-disc space-y-2 pl-6">
            {items}
          </ul>
        ),
      );
      continue;
    }
    blocks.push(
      <p key={key} className="whitespace-pre-wrap">
        {inline(line)}
      </p>,
    );
    index++;
  }
  return <div className="space-y-4 text-sm leading-7 text-foreground/90">{blocks}</div>;
}
