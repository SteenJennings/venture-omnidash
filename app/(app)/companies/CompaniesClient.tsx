"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Company } from "@/types/database.types";

type CompanyWithClipCount = Company & { clips: { count: number }[] };

const STATUS_ORDER = ["tracking", "active", "passed", "portfolio"];
const STATUS_LABELS: Record<string, string> = {
  tracking: "Tracking",
  active: "Active",
  passed: "Passed",
  portfolio: "Portfolio",
};

export default function CompaniesClient({
  companies,
}: {
  companies: CompanyWithClipCount[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const allStatuses = useMemo(() => {
    const set = new Set<string>();
    for (const c of companies) set.add(c.status ?? "tracking");
    return Array.from(set).sort(
      (a, b) => STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b)
    );
  }, [companies]);

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      if (statusFilter !== "all" && (c.status ?? "tracking") !== statusFilter)
        return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          (c.sector ?? "").toLowerCase().includes(q) ||
          (c.thesis ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [companies, search, statusFilter]);

  const grouped = filtered.reduce<Record<string, CompanyWithClipCount[]>>(
    (acc, c) => {
      const key = c.status ?? "tracking";
      if (!acc[key]) acc[key] = [];
      acc[key].push(c);
      return acc;
    },
    {}
  );

  const statusKeys =
    statusFilter === "all"
      ? [
          ...STATUS_ORDER.filter((s) => grouped[s]?.length),
          ...Object.keys(grouped).filter(
            (s) => !STATUS_ORDER.includes(s)
          ),
        ]
      : Object.keys(grouped);

  return (
    <div>
      {/* Search + status filter */}
      <div className="mb-6 flex gap-3">
        <input
          type="search"
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
        >
          <option value="all">All statuses</option>
          {allStatuses.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s] ?? s}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
          <p className="text-sm text-[var(--muted)]">No companies match.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {statusKeys.map((status) => (
            <section key={status}>
              <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
                {STATUS_LABELS[status] ?? status}
                <span className="ml-2 normal-case tracking-normal">
                  ({grouped[status].length})
                </span>
              </h2>
              <ul className="space-y-2">
                {grouped[status].map((company) => {
                  const clipCount = Number(company.clips?.[0]?.count ?? 0);
                  const updated = new Date(
                    company.updated_at
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <li key={company.id}>
                      <Link
                        href={`/companies/${company.id}`}
                        className="flex items-start justify-between gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 hover:border-[var(--accent)]/40 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[var(--text)]">
                              {company.name}
                            </span>
                            {company.stage && (
                              <span className="rounded bg-[var(--border)] px-1.5 py-0.5 text-xs text-[var(--muted)]">
                                {company.stage}
                              </span>
                            )}
                            {company.sector && (
                              <span className="text-xs text-[var(--muted)]">
                                {company.sector}
                              </span>
                            )}
                            {clipCount > 0 && (
                              <span className="rounded-full bg-[var(--accent)]/10 px-1.5 py-0.5 text-xs text-[var(--accent)]">
                                {clipCount} clip{clipCount !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                          {company.thesis && (
                            <p className="mt-1 truncate text-xs text-[var(--muted)]">
                              {company.thesis}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-xs text-[var(--muted)]">
                          {updated}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
