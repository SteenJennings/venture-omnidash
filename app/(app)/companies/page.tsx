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
    <div className="flex min-h-full flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/90 px-10 py-4 backdrop-blur-md">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-[var(--text)]">Companies</h1>
          <p className="mt-px text-[12px] text-[var(--muted)]">
            {items.length > 0
              ? `${items.length} compan${items.length !== 1 ? "ies" : "y"} tracked`
              : "Startups you're watching, meeting, or have passed on"}
          </p>
        </div>
        <AddCompanyButton variant="header" />
      </header>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[22px]">
            ⬡
          </div>
          <h2 className="text-[14px] font-semibold text-[var(--text)]">No companies tracked</h2>
          <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-[var(--muted)]">
            Track companies you're watching — startups that fit your thesis, ones you've met, or names on your radar.
          </p>
          <div className="mt-6">
            <AddCompanyButton />
          </div>
        </div>
      ) : (
        <div className="flex-1 px-10 py-6">
          <CompaniesClient companies={items} />
        </div>
      )}
    </div>
  );
}
