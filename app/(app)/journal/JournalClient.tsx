"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type EntryType = "outreach" | "meeting" | "event" | "learning" | "milestone" | "note";

interface JournalEntry {
  id: string;
  entry_date: string;
  entry_type: EntryType;
  title: string;
  notes: string | null;
  contact_name: string | null;
  contact_company: string | null;
  outcome: string | null;
  created_at: string;
}

const TYPE_META: Record<EntryType, { label: string; color: string; dot: string }> = {
  outreach:  { label: "Outreach",  color: "bg-sky-900/40 text-sky-400",      dot: "bg-sky-400" },
  meeting:   { label: "Meeting",   color: "bg-violet-900/40 text-violet-400", dot: "bg-violet-400" },
  event:     { label: "Event",     color: "bg-amber-900/40 text-amber-400",   dot: "bg-amber-400" },
  learning:  { label: "Learning",  color: "bg-emerald-900/40 text-emerald-400", dot: "bg-emerald-400" },
  milestone: { label: "Milestone", color: "bg-rose-900/40 text-rose-400",     dot: "bg-rose-400" },
  note:      { label: "Note",      color: "bg-[var(--surface-raised)] text-[var(--muted)]", dot: "bg-[var(--muted)]" },
};

const ALL_TYPES: EntryType[] = ["outreach", "meeting", "event", "learning", "milestone", "note"];

export default function JournalClient({ entries: initial }: { entries: JournalEntry[] }) {
  const [entries, setEntries] = useState(initial);
  const [filter, setFilter] = useState<EntryType | "all">("all");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const router = useRouter();

  const filtered = filter === "all" ? entries : entries.filter(e => e.entry_type === filter);

  // Group by date
  const grouped = filtered.reduce<Record<string, JournalEntry[]>>((acc, e) => {
    (acc[e.entry_date] ??= []).push(e);
    return acc;
  }, {});
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  function formatDate(d: string) {
    return new Date(d + "T12:00:00").toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric", year: "numeric",
    });
  }

  async function handleDelete(id: string) {
    await fetch(`/api/journal?id=${id}`, { method: "DELETE" });
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/90 px-10 py-4 backdrop-blur-md">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-[var(--text)]">Journal</h1>
          <p className="mt-px text-[12px] text-[var(--muted)]">
            {entries.length > 0
              ? `${entries.length} entr${entries.length !== 1 ? "ies" : "y"} · outreach, meetings, events, milestones`
              : "Your venture journey log — outreach, meetings, events, milestones"}
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-md border border-[var(--accent)]/50 bg-[var(--accent)]/[0.08] px-3 py-1.5 text-[12px] font-medium text-[var(--accent)] transition-all hover:bg-[var(--accent)]/[0.15]"
        >
          + Add entry
        </button>
      </header>

      {entries.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[22px]">
            ✦
          </div>
          <h2 className="text-[14px] font-semibold text-[var(--text)]">Start your venture journal</h2>
          <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-[var(--muted)]">
            Log outreach, coffee chats, events you attend, and milestones on your path into venture.
          </p>
          <button
            onClick={() => setOpen(true)}
            className="mt-6 rounded-md bg-[var(--accent)] px-3 py-1.5 text-[12px] font-semibold text-black transition-opacity hover:opacity-90"
          >
            + Add first entry
          </button>
        </div>
      ) : (
        <div className="flex-1 px-10 py-6">
          {/* Type filter */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                filter === "all"
                  ? "bg-[var(--text)] text-[var(--bg)]"
                  : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              All
            </button>
            {ALL_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                  filter === t
                    ? TYPE_META[t].color + " ring-1 ring-current/30"
                    : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {TYPE_META[t].label}
              </button>
            ))}
          </div>

          {/* Timeline */}
          <div className="space-y-8">
            {dates.map(date => (
              <div key={date}>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)]">
                  {formatDate(date)}
                </p>
                <div className="space-y-2">
                  {grouped[date].map(entry => {
                    const meta = TYPE_META[entry.entry_type];
                    const isExpanded = expanded === entry.id;
                    return (
                      <div
                        key={entry.id}
                        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 transition-all hover:border-[var(--border-subtle)] hover:bg-[var(--surface-raised)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2.5">
                              <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${meta.color}`}>
                                {meta.label}
                              </span>
                              <p className="truncate text-[13px] font-medium text-[var(--text)]">{entry.title}</p>
                            </div>
                            {(entry.contact_name || entry.contact_company) && (
                              <p className="mt-1 text-[12px] text-[var(--muted)]">
                                {[entry.contact_name, entry.contact_company].filter(Boolean).join(" · ")}
                              </p>
                            )}
                            {entry.notes && (
                              <p className={`mt-2 text-[12px] leading-relaxed text-[var(--muted)] ${!isExpanded ? "line-clamp-2" : ""}`}>
                                {entry.notes}
                              </p>
                            )}
                            {entry.outcome && (
                              <p className="mt-1.5 text-[12px] text-emerald-400/80">→ {entry.outcome}</p>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {entry.notes && entry.notes.length > 120 && (
                              <button
                                onClick={() => setExpanded(isExpanded ? null : entry.id)}
                                className="text-[11px] text-[var(--muted)] hover:text-[var(--text)]"
                              >
                                {isExpanded ? "Less" : "More"}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="text-[11px] text-[var(--muted-2)] transition-colors hover:text-red-400"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {open && (
        <AddEntryModal
          onClose={() => setOpen(false)}
          onSuccess={(entry) => {
            setEntries(prev => [entry, ...prev]);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function AddEntryModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (entry: JournalEntry) => void;
}) {
  const [type, setType] = useState<EntryType>("note");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactCompany, setContactCompany] = useState("");
  const [outcome, setOutcome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const showContact = ["outreach", "meeting"].includes(type);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry_date: date,
          entry_type: type,
          title: title.trim(),
          notes: notes.trim() || null,
          contact_name: contactName.trim() || null,
          contact_company: contactCompany.trim() || null,
          outcome: outcome.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Failed to save");
      }
      const entry = await res.json() as JournalEntry;
      onSuccess(entry);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text)]">New journal entry</h2>
          <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--text)]" aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type picker */}
          <div>
            <label className="mb-2 block text-xs text-[var(--muted)]">Type</label>
            <div className="flex flex-wrap gap-2">
              {ALL_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                    type === t
                      ? TYPE_META[t].color + " ring-1 ring-current/40"
                      : "bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {TYPE_META[t].label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div>
              <label className="mb-1.5 block text-xs text-[var(--muted)]">Title <span className="text-red-400">*</span></label>
              <input
                type="text"
                autoFocus
                placeholder={
                  type === "outreach" ? "Emailed Jane Smith at Benchmark" :
                  type === "meeting" ? "Coffee chat with Sarah at a16z" :
                  type === "event" ? "YC Demo Day Spring 2026" :
                  type === "learning" ? "Read The Hard Thing About Hard Things" :
                  type === "milestone" ? "First sourced deal" :
                  "Note about today"
                }
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted-2)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[var(--muted)]">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          </div>

          {showContact && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs text-[var(--muted)]">Contact name</label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted-2)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-[var(--muted)]">Their firm / company</label>
                <input
                  type="text"
                  placeholder="Benchmark"
                  value={contactCompany}
                  onChange={e => setContactCompany(e.target.value)}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted-2)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs text-[var(--muted)]">Notes</label>
            <textarea
              placeholder="What happened? What did you learn? What's the follow-up?"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted-2)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-[var(--muted)]">Outcome / next step</label>
            <input
              type="text"
              placeholder="Follow up in 2 weeks, intro to their GP, etc."
              value={outcome}
              onChange={e => setOutcome(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted-2)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)]">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {loading ? "Saving…" : "Save entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
