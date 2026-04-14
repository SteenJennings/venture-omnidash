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

  // Fetch companies not already in a deal, for the add form
  const dealCompanyIds = items.map((d) => d.company_id);
  const { data: allCompanies } = await supabase
    .from("companies")
    .select("id, name")
    .eq("user_id", uid)
    .order("name");

  const companies = (allCompanies ?? []) as Pick<Company, "id" | "name">[];

  // Group by stage
  const grouped = STAGES.reduce<Record<Stage, DealWithCompany[]>>(
    (acc, stage) => {
      acc[stage] = items.filter((d) => d.stage === stage);
      return acc;
    },
    {} as Record<Stage, DealWithCompany[]>
  );

  const activeDeals = items.filter(
    (d) => d.stage !== "passed" && d.stage !== "invested"
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">Deals</h1>
          <p className="text-sm text-[var(--muted)]">
            {activeDeals.length} active · {items.length} total · pipeline from sourced to invested
          </p>
        </div>
      </div>

      <DealsClient
        grouped={grouped}
        stages={[...STAGES]}
        companies={companies}
        dealCompanyIds={dealCompanyIds}
      />
    </div>
  );
}
