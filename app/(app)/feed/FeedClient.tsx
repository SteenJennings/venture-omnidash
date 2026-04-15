"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Clip } from "@/types/database.types";

type Thesis = { id: string; title: string };

const SOURCE_STYLES: Record<string, { border: string; badge: string; label: string }> = {
  tweet:        { border: "border-l-sky-500/60",    badge: "bg-sky-900/40 text-sky-400",     label: "Tweet" },
  article:      { border: "border-l-violet-500/60", badge: "bg-violet-900/40 text-violet-400", label: "Article" },
  conversation: { border: "border-l-emerald-500/60",badge: "bg-emerald-900/40 text-emerald-400",label: "Convo" },
  thought:      { border: "border-l-[var(--muted-2)]", badge: "bg-[var(--border)] text-[var(--muted)]", label: "Thought" },
};

function getSourceStyle(type: string) {
  return SOURCE_STYLES[type] ?? { border: "border-l-[var(--border)]", badge: "bg-[var(--border)] text-[var(--muted)]", label: type };
}

export default function FeedClient({ clips }: { clips: Clip[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [theses, setTheses] = useState<Thesis[]>([]);

  useEffect(() => {
    fetch("/api/theses")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setTheses(data as Thesis[]))
      .catch(() => {});
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const clip of clips) for (const tag of clip.tags ?? []) set.add(tag);
    return Array.from(set).sort();
  }, [clips]);

  const filtered = useMemo(() => {
    return clips.filter((clip) => {
      if (activeTag && !(clip.tags ?? []).includes(activeTag)) return false;
      if (search && !clip.note.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [clips, activeTag, search]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/clips?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setConfirmId(null);
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLinkThesis(clipId: string, thesisId: string) {
    if (!thesisId) return;
    const res = await fetch("/api/thesis-clips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clip_id: clipId, thesis_id: thesisId }),
    });
    if (res.ok) setLinkingId(null);
  }

  return (
    <div>
      {/* Search + tag bar */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-2)]" width="13" height="13" viewBox="0 0 15 15" fill="none">
            <path d="M10 6.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm-.534 3.88 2.653 2.652-.707.707-2.652-2.653A4.5 4.5 0 1 1 9.466 10.38Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
          </svg>
          <input
            type="search"
            placeholder="Search signals…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-[13px] text-[var(--text)] placeholder:text-[var(--muted-2)] transition-colors focus:border-[var(--accent)]/50 focus:outline-none"
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activeTag && (
              <button
                onClick={() => setActiveTag(null)}
                className="flex items-center gap-1 rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-2.5 py-1 text-[11px] font-medium text-[var(--accent)]"
              >
                {activeTag}
                <span className="opacity-60">✕</span>
              </button>
            )}
            {allTags.filter((t) => t !== activeTag).map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--muted)] transition-colors hover:border-[var(--border-subtle)] hover:text-[var(--text)]"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] py-12 text-center">
          <p className="text-[13px] text-[var(--muted)]">No clips match.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((clip) => {
            const expanded = expandedId === clip.id;
            const confirming = confirmId === clip.id;
            const deleting = deletingId === clip.id;
            const showingLink = linkingId === clip.id;
            const src = getSourceStyle(clip.source_type);
            const date = new Date(clip.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });

            return (
              <li
                key={clip.id}
                className={`rounded-xl border border-[var(--border)] border-l-2 bg-[var(--surface)] transition-colors hover:bg-[var(--surface-raised)] ${src.border}`}
              >
                <div className="px-4 py-3.5">
                  {/* Note */}
                  <button
                    onClick={() => setExpandedId(expanded ? null : clip.id)}
                    className="w-full text-left"
                  >
                    <p className={`text-[13px] leading-relaxed text-[var(--text)] ${expanded ? "" : "line-clamp-3"}`}>
                      {clip.note}
                    </p>
                    {!expanded && clip.note.length > 200 && (
                      <span className="mt-1 block text-[11px] text-[var(--muted)]">Show more ↓</span>
                    )}
                  </button>

                  {/* URL */}
                  {clip.url && (
                    <a
                      href={clip.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block truncate text-[11px] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
                    >
                      {clip.url}
                    </a>
                  )}

                  {/* Tags */}
                  {clip.tags && clip.tags.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {clip.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                            activeTag === tag
                              ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                              : "bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--text)]"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Thesis linker */}
                  {showingLink && theses.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <select
                        defaultValue=""
                        onChange={(e) => handleLinkThesis(clip.id, e.target.value)}
                        className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 text-[12px] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                      >
                        <option value="" disabled>Select thesis…</option>
                        {theses.map((t) => (
                          <option key={t.id} value={t.id}>{t.title}</option>
                        ))}
                      </select>
                      <button onClick={() => setLinkingId(null)} className="text-[12px] text-[var(--muted)] hover:text-[var(--text)]">
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${src.badge}`}>{src.label}</span>
                      <span className="text-[11px] text-[var(--muted-2)]">{date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {theses.length > 0 && !showingLink && (
                        <button
                          onClick={() => setLinkingId(clip.id)}
                          className="text-[11px] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
                        >
                          + thesis
                        </button>
                      )}
                      {confirming ? (
                        <span className="flex items-center gap-1.5">
                          <span className="text-[11px] text-[var(--muted)]">Delete?</span>
                          <button onClick={() => handleDelete(clip.id)} disabled={deleting} className="text-[11px] text-red-400 hover:text-red-300 disabled:opacity-50">
                            {deleting ? "…" : "Yes"}
                          </button>
                          <button onClick={() => setConfirmId(null)} className="text-[11px] text-[var(--muted)] hover:text-[var(--text)]">No</button>
                        </span>
                      ) : (
                        <button onClick={() => setConfirmId(clip.id)} className="text-[11px] text-[var(--muted)] transition-colors hover:text-red-400">
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
