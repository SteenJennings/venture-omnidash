"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Company } from "@/types/database.types";

type CompanyWithClipCount = Company & { clips: { count: number }[] };

const STATUS_COLORS: Record<string, string> = {
  watching:   "text-[var(--muted)]",
  tracking:   "text-sky-400",
  diligence:  "text-amber-400",
  passed:     "text-[var(--muted-2)]",
  invested:   "text-emerald-400",
};

export default function CompaniesClient({ companies }: { companies: CompanyWithClipCount[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const allStatuses = useMemo(() => {
    const set = new Set<string>();
    for (const c of companies) set.add(c.status ?? "watching");
    return Array.from(set);
  }, [companies]);

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      if (statusFilter !== "all" && (c.status ?? "watching") !== statusFilter) return false;
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

  return (
    <div>
      {/* Search + status tabs */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[160px]">
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-2)]" width="13" height="13" viewBox="0 0 15 15" fill="none">
            <path d="M10 6.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm-.534 3.88 2.653 2.652-.707.707-2.652-2.653A4.5 4.5 0 1 1 9.466 10.38Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
          </svg>
          <input
            type="search"
            placeholder="Search companies…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-[13px] text-[var(--text)] placeholder:text-[var(--muted-2)] transition-colors focus:border-[var(--accent)]/50 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1">
          {["all", ...allStatuses].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-md px-3 py-1 text-[11px] font-medium capitalize transition-all ${
                statusFilter === s
                  ? "bg-[var(--surface-raised)] text-[var(--text)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] py-12 text-center">
          <p className="text-[13px] text-[var(--muted)]">No companies match.</p>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {filtered.map((company) => {
            const clipCount = Number(company.clips?.[0]?.count ?? 0);
            const updated = new Date(company.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const status = company.status ?? "watching";
            const statusColor = STATUS_COLORS[status] ?? "text-[var(--muted)]";

            return (
              <li key={company.id}>
                <Link
                  href={`/companies/${company.id}`}
                  className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3.5 transition-all hover:border-[var(--accent)]/30 hover:bg-[var(--surface-raised)]"
                >
                  {/* Status dot */}
                  <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    status === "invested" ? "bg-emerald-400" :
                    status === "diligence" ? "bg-amber-400" :
                    status === "tracking" ? "bg-sky-400" :
                    status === "passed" ? "bg-[var(--muted-2)]" : "bg-[var(--border)]"
                  }`} />

                  {/* Name + meta */}
                  <div className="min-w-0 flex-1">
                    <span className="text-[14px] font-medium text-[var(--text)]">{company.name}</span>
                    {(company.sector || company.stage) && (
                      <span className="ml-2 text-[12px] text-[var(--muted)]">
                        {[company.sector, company.stage].filter(Boolean).join(" · ")}
                      </span>
                    )}
                    {company.thesis && (
                      <p className="mt-0.5 truncate text-[11px] text-[var(--muted)]">{company.thesis}</p>
                    )}
                  </div>

                  {/* Right meta */}
                  <div className="flex shrink-0 items-center gap-4">
                    {clipCount > 0 && (
                      <span className="text-[11px] text-[var(--muted)]">{clipCount} clip{clipCount !== 1 ? "s" : ""}</span>
                    )}
                    <span className={`text-[11px] font-medium capitalize ${statusColor}`}>{status}</span>
                    <span className="text-[11px] text-[var(--muted-2)]">{updated}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
