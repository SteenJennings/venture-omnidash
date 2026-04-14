import { createClient } from "@/lib/supabase/server";
import { getPageUser } from "@/lib/dev-user";
import type { Company } from "@/types/database.types";
import AddCompanyButton from "./AddCompanyButton";
import CompaniesClient from "./CompaniesClient";

type CompanyWithClipCount = Company & { clips: { count: number }[] };

export default async function CompaniesPage() {
  const { id: uid } = await getPageUser();
  const supabase = await createClient();

  const { data: companies } = await supabase
    .from("companies")
    .select("*, clips(count)")
    .eq("user_id", uid)
    .order("updated_at", { ascending: false });

  const items = (companies ?? []) as unknown as CompanyWithClipCount[];

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
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
        <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
          <p className="text-sm text-[var(--muted)]">No companies yet.</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Add a company to start tracking it.
          </p>
        </div>
      ) : (
        <CompaniesClient companies={items} />
      )}
    </div>
  );
}
