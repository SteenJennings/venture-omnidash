"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Deal, Company } from "@/types/database.types";

type DealWithCompany = Deal & { companies: Company };

const STAGE_LABELS: Record<string, string> = {
  sourced: "Sourced",
  meeting: "Meeting",
  diligence: "Diligence",
  passed: "Passed",
  invested: "Invested",
};

const STAGE_COLORS: Record<string, string> = {
  sourced: "bg-[var(--border)] text-[var(--muted)]",
  meeting: "bg-blue-900/30 text-blue-400",
  diligence: "bg-purple-900/30 text-purple-400",
  passed: "bg-[var(--border)] text-[var(--muted)] opacity-60",
  invested: "bg-emerald-900/30 text-emerald-400",
};

export default function DealsClient({
  grouped,
  stages,
  companies,
  dealCompanyIds,
}: {
  grouped: Record<string, DealWithCompany[]>;
  stages: string[];
  companies: Pick<Company, "id" | "name">[];
  dealCompanyIds: string[];
}) {
  const router = useRouter();
  const [addingToStage, setAddingToStage] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(stage: string) {
    if (!selectedCompany) return;
    setSaving(true);
    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: selectedCompany,
          stage,
          next_action: nextAction.trim() || null,
        }),
      });
      if (res.ok) {
        setAddingToStage(null);
        setSelectedCompany("");
        setNextAction("");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleStageChange(dealId: string, newStage: string) {
    await fetch(`/api/deals?id=${encodeURIComponent(dealId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    });
    router.refresh();
  }

  async function handleDelete(dealId: string) {
    await fetch(`/api/deals?id=${encodeURIComponent(dealId)}`, {
      method: "DELETE",
    });
    router.refresh();
  }

  const activeStages = stages.filter((s) => s !== "passed" && s !== "invested");
  const closedStages = stages.filter((s) => s === "passed" || s === "invested");

  return (
    <div className="space-y-8">
      {/* Active pipeline */}
      <div className="grid gap-4 sm:grid-cols-3">
        {activeStages.map((stage) => (
          <StageColumn
            key={stage}
            stage={stage}
            deals={grouped[stage] ?? []}
            stages={stages}
            companies={companies}
            dealCompanyIds={dealCompanyIds}
            addingToStage={addingToStage}
            selectedCompany={selectedCompany}
            nextAction={nextAction}
            saving={saving}
            onAddClick={() => { setAddingToStage(stage); setSelectedCompany(""); setNextAction(""); }}
            onCancelAdd={() => setAddingToStage(null)}
            onAdd={() => handleAdd(stage)}
            onCompanySelect={setSelectedCompany}
            onNextActionChange={setNextAction}
            onStageChange={handleStageChange}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Closed deals */}
      {closedStages.some((s) => (grouped[s] ?? []).length > 0) && (
        <div>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
            Closed
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {closedStages.map((stage) =>
              (grouped[stage] ?? []).length > 0 ? (
                <ClosedColumn
                  key={stage}
                  stage={stage}
                  deals={grouped[stage] ?? []}
                  stages={stages}
                  onStageChange={handleStageChange}
                  onDelete={handleDelete}
                />
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StageColumn({
  stage,
  deals,
  stages,
  companies,
  dealCompanyIds,
  addingToStage,
  selectedCompany,
  nextAction,
  saving,
  onAddClick,
  onCancelAdd,
  onAdd,
  onCompanySelect,
  onNextActionChange,
  onStageChange,
  onDelete,
}: {
  stage: string;
  deals: DealWithCompany[];
  stages: string[];
  companies: Pick<Company, "id" | "name">[];
  dealCompanyIds: string[];
  addingToStage: string | null;
  selectedCompany: string;
  nextAction: string;
  saving: boolean;
  onAddClick: () => void;
  onCancelAdd: () => void;
  onAdd: () => void;
  onCompanySelect: (id: string) => void;
  onNextActionChange: (v: string) => void;
  onStageChange: (id: string, stage: string) => void;
  onDelete: (id: string) => void;
}) {
  const isAdding = addingToStage === stage;
  const availableCompanies = companies.filter(
    (c) => !dealCompanyIds.includes(c.id)
  );

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-medium text-[var(--text)]">
          {STAGE_LABELS[stage]}
          {deals.length > 0 && (
            <span className="ml-1.5 text-[var(--muted)]">({deals.length})</span>
          )}
        </h2>
        {!isAdding && (
          <button
            onClick={onAddClick}
            className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
          >
            + Add
          </button>
        )}
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="mb-3 rounded-md border border-[var(--accent)]/30 bg-[var(--bg)] p-3 space-y-2">
          <select
            value={selectedCompany}
            onChange={(e) => onCompanySelect(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
          >
            <option value="">Select company…</option>
            {availableCompanies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            value={nextAction}
            onChange={(e) => onNextActionChange(e.target.value)}
            placeholder="Next action (optional)"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={onAdd}
              disabled={saving || !selectedCompany}
              className="flex-1 rounded-md bg-[var(--accent)] py-1.5 text-xs font-medium text-black disabled:opacity-40"
            >
              {saving ? "Adding…" : "Add"}
            </button>
            <button
              onClick={onCancelAdd}
              className="text-xs text-[var(--muted)] hover:text-[var(--text)]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Deal cards */}
      <ul className="space-y-2">
        {deals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            stages={stages}
            onStageChange={onStageChange}
            onDelete={onDelete}
          />
        ))}
      </ul>

      {deals.length === 0 && !isAdding && (
        <p className="text-xs text-[var(--muted)] opacity-50">Empty</p>
      )}
    </div>
  );
}

function ClosedColumn({
  stage,
  deals,
  stages,
  onStageChange,
  onDelete,
}: {
  stage: string;
  deals: DealWithCompany[];
  stages: string[];
  onStageChange: (id: string, stage: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <h2 className="mb-3 text-xs font-medium text-[var(--text)]">
        {STAGE_LABELS[stage]}
        <span className="ml-1.5 text-[var(--muted)]">({deals.length})</span>
      </h2>
      <ul className="space-y-2">
        {deals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            stages={stages}
            onStageChange={onStageChange}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
}

function DealCard({
  deal,
  stages,
  onStageChange,
  onDelete,
}: {
  deal: DealWithCompany;
  stages: string[];
  onStageChange: (id: string, stage: string) => void;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const stageBadge = STAGE_COLORS[deal.stage ?? "sourced"] ?? STAGE_COLORS.sourced;

  const daysSince = Math.floor(
    (Date.now() - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <li className="rounded-md border border-[var(--border)] bg-[var(--bg)] p-3">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/companies/${deal.company_id}`}
          className="text-xs font-medium text-[var(--text)] hover:text-[var(--accent)] transition-colors"
        >
          {deal.companies?.name ?? "Unknown"}
        </Link>
        <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs ${stageBadge}`}>
          {STAGE_LABELS[deal.stage ?? "sourced"]}
        </span>
      </div>

      {deal.next_action && (
        <p className="mt-1.5 text-xs text-[var(--muted)]">
          → {deal.next_action}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-xs text-[var(--muted)]">
          {daysSince === 0 ? "Today" : `${daysSince}d ago`}
        </span>

        <div className="flex items-center gap-2">
          <select
            value={deal.stage ?? "sourced"}
            onChange={(e) => onStageChange(deal.id, e.target.value)}
            className="rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-xs text-[var(--muted)] focus:outline-none"
          >
            {stages.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABELS[s]}
              </option>
            ))}
          </select>

          {confirming ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { onDelete(deal.id); setConfirming(false); }}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Del
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="text-xs text-[var(--muted)]"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="text-xs text-[var(--muted)] hover:text-red-400 transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
