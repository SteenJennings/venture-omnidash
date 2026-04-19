"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Thesis } from "@/types/database.types";

export default function ThesisActions({ thesis }: { thesis: Thesis }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(thesis.title);
  const [description, setDescription] = useState(thesis.description ?? "");
  const [confidence, setConfidence] = useState(thesis.confidence ?? 50);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/theses?id=${encodeURIComponent(thesis.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || null,
            confidence,
          }),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Save failed");
      }
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/theses?id=${encodeURIComponent(thesis.id)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Delete failed");
      router.push("/theses");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setDeleting(false);
    }
  }

  if (!editing) {
    return (
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => setEditing(true)}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          Edit
        </button>
        {confirming ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted)]">Delete?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Yes"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs text-[var(--muted)] hover:text-[var(--text)]"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="text-xs text-[var(--muted)] hover:text-red-400 transition-colors"
          >
            Delete
          </button>
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-lg border border-[var(--accent)]/30 bg-[var(--surface)] p-5">
      <h2 className="mb-4 text-sm font-medium text-[var(--text)]">Edit thesis</h2>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-[var(--muted)]">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-[var(--border-input)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--muted)]">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-md border border-[var(--border-input)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs text-[var(--muted)]">Confidence</label>
            <span className="text-xs font-medium text-[var(--accent)]">
              {confidence}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
          <div className="mt-1 flex justify-between text-xs text-[var(--muted)]">
            <span>Exploratory</span>
            <span>Convicted</span>
          </div>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex justify-end gap-3 pt-1">
          <button
            onClick={() => {
              setEditing(false);
              setTitle(thesis.title);
              setDescription(thesis.description ?? "");
              setConfidence(thesis.confidence ?? 50);
            }}
            className="rounded-md px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
