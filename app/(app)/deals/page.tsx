import { createClient } from "@/lib/supabase/server";
import { getPageUser } from "@/lib/dev-user";
import type { Deal, Company } from "@/types/database.types";
import DealsClient from "./DealsClient";

type DealWithCompany = Deal & { companies: Company };

const STAGES = ["sourced", "meeting", "diligence", "passed", "invested"] as const;
type Stage = (typeof STAGES)[number];

export default async function DealsPage() {
  const { id: uid } = await getPageUser();
  const supabase = await createClient();

  const { data: deals } = await supabase
    .from("deals")
    .select("*, companies(*)")
    .eq("user_id", uid)
    .order("updated_at", { ascending: false });

  const items = (deals ?? []) as unknown as DealWithCompany[];

  const dealCompanyIds = items.map((d) => d.company_id);
  const { data: allCompanies } = await supabase
    .from("companies")
    .select("id, name")
    .eq("user_id", uid)
    .order("name");

  const companies = (allCompanies ?? []) as Pick<Company, "id" | "name">[];

  const grouped = STAGES.reduce<Record<Stage, DealWithCompany[]>>(
    (acc, stage) => { acc[stage] = items.filter((d) => d.stage === stage); return acc; },
    {} as Record<Stage, DealWithCompany[]>
  );

  const activeDeals = items.filter((d) => d.stage !== "passed" && d.stage !== "invested");

  return (
    <div className="flex min-h-full flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/90 px-10 py-4 backdrop-blur-md">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-[var(--text)]">Deals</h1>
          <p className="mt-px text-[12px] text-[var(--muted)]">
            {items.length > 0
              ? `${activeDeals.length} active · ${items.length} total · sourced → invested`
              : "Your deal pipeline from first contact to close"}
          </p>
        </div>
      </header>

      <div className="flex-1 px-8 py-6">
        <DealsClient
          grouped={grouped}
          stages={[...STAGES]}
          companies={companies}
          dealCompanyIds={dealCompanyIds}
        />
      </div>
    </div>
  );
}
