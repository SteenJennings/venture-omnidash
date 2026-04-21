"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Company } from "@/types/database.types";

const STAGES = ["", "pre-seed", "seed", "series-a", "series-b", "growth"];
const STATUSES = ["tracking", "active", "passed", "portfolio"];

export default function CompanyActions({ company }: { company: Company }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(company.name);
  const [sector, setSector] = useState(company.sector ?? "");
  const [stage, setStage] = useState(company.stage ?? "");
  const [status, setStatus] = useState(company.status ?? "tracking");
  const [thesis, setThesis] = useState(company.thesis ?? "");
  const [keyUnknowns, setKeyUnknowns] = useState(company.key_unknowns ?? "");
  const [website, setWebsite] = useState(company.website ?? "");
  const [linkedin, setLinkedin] = useState(company.linkedin ?? "");

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/companies?id=${encodeURIComponent(company.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            sector: sector.trim() || null,
            stage: stage || null,
            status,
            thesis: thesis.trim() || null,
            key_unknowns: keyUnknowns.trim() || null,
            website: website.trim() || null,
            linkedin: linkedin.trim() || null,
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
        `/api/companies?id=${encodeURIComponent(company.id)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Delete failed");
      router.push("/companies");
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
      <h2 className="mb-4 text-sm font-medium text-[var(--text)]">Edit company</h2>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-[var(--muted)]">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-[var(--border-input)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">Sector</label>
            <input
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="B2B SaaS"
              className="w-full rounded-md border border-[var(--border-input)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full rounded-md border border-[var(--border-input)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s || "—"}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--muted)]">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border border-[var(--border-input)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--muted)]">Thesis</label>
          <textarea
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-md border border-[var(--border-input)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--muted)]">Key Unknowns</label>
          <textarea
            value={keyUnknowns}
            onChange={(e) => setKeyUnknowns(e.target.value)}
            placeholder="What do you need to find out?"
            rows={2}
            className="w-full resize-none rounded-md border border-[var(--border-input)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">Website</label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="stripe.com"
              className="w-full rounded-md border border-[var(--border-input)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">LinkedIn</label>
            <input
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="linkedin.com/company/stripe"
              className="w-full rounded-md border border-[var(--border-input)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex justify-end gap-3 pt-1">
          <button
            onClick={() => {
              setEditing(false);
              // Reset to original values
              setName(company.name);
              setSector(company.sector ?? "");
              setStage(company.stage ?? "");
              setStatus(company.status ?? "tracking");
              setThesis(company.thesis ?? "");
              setKeyUnknowns(company.key_unknowns ?? "");
              setWebsite(company.website ?? "");
              setLinkedin(company.linkedin ?? "");
            }}
            className="rounded-md px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
