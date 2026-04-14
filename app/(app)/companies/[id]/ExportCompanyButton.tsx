"use client";

import { useState } from "react";
import type { Company, Clip } from "@/types/database.types";

export default function ExportCompanyButton({
  company,
  clips,
}: {
  company: Company;
  clips: Clip[];
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

    const text = [
      `COMPANY: ${company.name}`,
      `Status: ${company.status ?? "tracking"} | Stage: ${company.stage ?? "—"} | Sector: ${company.sector ?? "—"}`,
      "",
      `THESIS:`,
      company.thesis ?? "(none)",
      "",
      `KEY UNKNOWNS:`,
      company.key_unknowns ?? "(none)",
      "",
      `RESEARCH CLIPS (${clips.length}):`,
      clipsText,
    ].join("\n");

    const prompt = `You are a VC research assistant helping me evaluate an early-stage investment. Below is my research brief for ${company.name}.\n\nPlease:\n1. Summarize the investment opportunity in 2-3 sentences\n2. Rate the strength of the thesis (1-10) and explain why\n3. Identify the 2-3 most important unknowns to resolve before conviction\n4. Suggest 3 specific questions to ask the founders\n5. Give me a bear case: what would make this a bad investment?\n\n---\n\n${text}`;

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
