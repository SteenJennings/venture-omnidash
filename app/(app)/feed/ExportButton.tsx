"use client";

import { useState } from "react";
import type { Clip } from "@/types/database.types";

export default function ExportButton({ clips }: { clips: Clip[] }) {
  const [copied, setCopied] = useState(false);

  function handleExport() {
    const text = clips
      .map((clip) => {
        const date = new Date(clip.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        const tags = clip.tags?.length ? `[${clip.tags.join(", ")}]` : "";
        const url = clip.url ? `\n  URL: ${clip.url}` : "";
        return `[${date}] (${clip.source_type}) ${tags}\n${clip.note}${url}`;
      })
      .join("\n\n---\n\n");

    const prompt = `You are a VC research assistant. Below are my research clips — observations, articles, tweets, and conversations I've captured while tracking early-stage companies and market trends.\n\nPlease:\n1. Identify the 3-5 strongest signals or themes\n2. Note which areas have the most evidence\n3. Surface any companies or founders mentioned multiple times\n4. Suggest what I should investigate next\n\n---\n\n${text}`;

    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (clips.length === 0) return null;

  return (
    <button
      onClick={handleExport}
      className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--text)]"
    >
      {copied ? "Copied!" : "Export for Claude"}
    </button>
  );
}
