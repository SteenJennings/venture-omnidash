import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Company } from "@/types/database.types";
import AddCompanyButton from "./AddCompanyButton";

const STATUS_ORDER = ["tracking", "active", "passed", "portfolio"] as const;

const STATUS_LABELS: Record<string, string> = {
  tracking: "Tracking",
  active: "Active",
  passed: "Passed",
  portfolio: "Portfolio",
};

export default async function CompaniesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: companies } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", user!.id)
    .order("updated_at", { ascending: false });

  const items = (companies ?? []) as Company[];

  // Group by status
  const grouped = items.reduce<Record<string, Company[]>>((acc, c) => {
    const key = c.status ?? "tracking";
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  const statusKeys = [
    ...STATUS_ORDER.filter((s) => grouped[s]?.length),
    ...Object.keys(grouped).filter(
      (s) => !(STATUS_ORDER as readonly string[]).includes(s)
    ),
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">Companies</h1>
          <p className="text-sm text-[var(--muted)]">
            {items.length} compan{items.length !== 1 ? "ies" : "y"}
          </p>
        </div>
        <AddCompanyButton />
      </div>

      {items.length === 0 ? (
        <EmptyState />
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
                {grouped[status].map((company) => (
                  <CompanyRow key={company.id} company={company} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function CompanyRow({ company }: { company: Company }) {
  const updated = new Date(company.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <li>
      <Link
        href={`/companies/${company.id}`}
        className="flex items-start justify-between gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 hover:border-[var(--accent)]/40 transition-colors"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--text)]">{company.name}</span>
            {company.stage && (
              <span className="rounded bg-[var(--border)] px-1.5 py-0.5 text-xs text-[var(--muted)]">
                {company.stage}
              </span>
            )}
            {company.sector && (
              <span className="text-xs text-[var(--muted)]">{company.sector}</span>
            )}
          </div>
          {company.thesis && (
            <p className="mt-1 truncate text-xs text-[var(--muted)]">
              {company.thesis}
            </p>
          )}
        </div>
        <span className="shrink-0 text-xs text-[var(--muted)]">{updated}</span>
      </Link>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
      <p className="text-sm text-[var(--muted)]">No companies yet.</p>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Add a company to start tracking it.
      </p>
    </div>
  );
}
