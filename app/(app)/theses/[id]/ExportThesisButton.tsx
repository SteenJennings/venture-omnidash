"use client";

import { useState } from "react";
import type { Thesis, Clip, Company } from "@/types/database.types";

export default function ExportThesisButton({
  thesis,
  clips,
  companies,
}: {
  thesis: Thesis;
  clips: Clip[];
  companies: Company[];
}) {
  const [copied, setCopied] = useState(false);

  function handleExport() {
    const clipsText =
      clips.length > 0
        ? clips
            .map((clip) => {
              const date = new Date(clip.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });
              const tags = clip.tags?.length ? ` [${clip.tags.join(", ")}]` : "";
              const url = clip.url ? `\n  URL: ${clip.url}` : "";
              return `  [${date}] (${clip.source_type})${tags}\n  ${clip.note}${url}`;
            })
            .join("\n\n")
        : "  (no clips yet)";

    const companiesText =
      companies.length > 0
        ? companies.map((c) => `  - ${c.name} (${c.status ?? "tracking"}, ${c.stage ?? "—"})`).join("\n")
        : "  (no companies linked)";

    const text = [
      `THESIS: ${thesis.title}`,
      `Confidence: ${thesis.confidence ?? "—"}%`,
      "",
      `DESCRIPTION:`,
      thesis.description ?? "(none)",
      "",
      `COMPANIES TRACKING THIS THESIS (${companies.length}):`,
      companiesText,
      "",
      `SUPPORTING CLIPS (${clips.length}):`,
      clipsText,
    ].join("\n");

    const prompt = `You are a VC research assistant helping me develop and stress-test an investment thesis.\n\nBelow is my thesis brief, including supporting evidence clips and companies I'm tracking.\n\nPlease:\n1. Evaluate the thesis: is the logic sound? What's missing?\n2. Rate the evidence quality (1-10): are the clips actually supporting the thesis or just correlated?\n3. What's the strongest counter-argument to this thesis?\n4. Which of the linked companies is best positioned to win if the thesis is right?\n5. What would need to be true for this thesis to have 10x conviction?\n\n---\n\n${text}`;

    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleExport}
      className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--text)]"
    >
      {copied ? "Copied!" : "Export for Claude"}
    </button>
  );
}
