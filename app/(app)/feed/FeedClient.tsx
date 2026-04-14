"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Clip } from "@/types/database.types";

type Thesis = { id: string; title: string };

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

  // All unique tags across clips
  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const clip of clips) {
      for (const tag of clip.tags ?? []) set.add(tag);
    }
    return Array.from(set).sort();
  }, [clips]);

  const filtered = useMemo(() => {
    return clips.filter((clip) => {
      if (activeTag && !(clip.tags ?? []).includes(activeTag)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!clip.note.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [clips, activeTag, search]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/clips?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
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
      {/* Search + tag filters */}
      <div className="mb-6 space-y-3">
        <input
          type="search"
          placeholder="Search clips..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
        />

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activeTag && (
              <button
                onClick={() => setActiveTag(null)}
                className="rounded-full border border-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 text-xs text-[var(--accent)]"
              >
                {activeTag} ✕
              </button>
            )}
            {allTags
              .filter((t) => t !== activeTag)
              .map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className="rounded-full bg-[var(--bg)] px-2 py-0.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                >
                  {tag}
                </button>
              ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
          <p className="text-sm text-[var(--muted)]">No clips match.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((clip) => {
            const expanded = expandedId === clip.id;
            const confirming = confirmId === clip.id;
            const deleting = deletingId === clip.id;
            const showingLink = linkingId === clip.id;
            const date = new Date(clip.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            return (
              <li
                key={clip.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                {/* Top row */}
                <div className="mb-2 flex items-start justify-between gap-3">
                  <button
                    onClick={() => setExpandedId(expanded ? null : clip.id)}
                    className="flex-1 text-left"
                  >
                    <p
                      className={`text-sm leading-relaxed text-[var(--text)] ${
                        expanded ? "" : "line-clamp-3"
                      }`}
                    >
                      {clip.note}
                    </p>
                    {!expanded && clip.note.length > 200 && (
                      <span className="mt-0.5 text-xs text-[var(--muted)]">
                        Show more
                      </span>
                    )}
                  </button>
                  <span className="shrink-0 rounded bg-[var(--border)] px-1.5 py-0.5 text-xs text-[var(--muted)]">
                    {clip.source_type}
                  </span>
                </div>

                {clip.url && (
                  <a
                    href={clip.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-2 block truncate text-xs text-[var(--muted)] hover:text-[var(--accent)]"
                  >
                    {clip.url}
                  </a>
                )}

                {clip.tags && clip.tags.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {clip.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() =>
                          setActiveTag(activeTag === tag ? null : tag)
                        }
                        className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
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

                {/* Link to thesis inline selector */}
                {showingLink && theses.length > 0 && (
                  <div className="mb-2 flex items-center gap-2">
                    <select
                      defaultValue=""
                      onChange={(e) =>
                        handleLinkThesis(clip.id, e.target.value)
                      }
                      className="flex-1 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 text-xs text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                    >
                      <option value="" disabled>
                        Select thesis…
                      </option>
                      {theses.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setLinkingId(null)}
                      className="text-xs text-[var(--muted)] hover:text-[var(--text)]"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[var(--muted)]">{date}</p>

                  <div className="flex items-center gap-3">
                    {theses.length > 0 && !showingLink && (
                      <button
                        onClick={() => setLinkingId(clip.id)}
                        className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                      >
                        + thesis
                      </button>
                    )}

                    {confirming ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--muted)]">
                          Delete?
                        </span>
                        <button
                          onClick={() => handleDelete(clip.id)}
                          disabled={deleting}
                          className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                        >
                          {deleting ? "Deleting…" : "Yes"}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="text-xs text-[var(--muted)] hover:text-[var(--text)]"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(clip.id)}
                        className="text-xs text-[var(--muted)] hover:text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    )}
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
