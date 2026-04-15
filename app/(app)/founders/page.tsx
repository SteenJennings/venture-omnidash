import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPageUser } from "@/lib/dev-user";
import type { Founder } from "@/types/database.types";
import AddFounderButton from "./AddFounderButton";

export default async function FoundersPage() {
  const { id: uid } = await getPageUser();
  const supabase = await createClient();

  const { data: founders } = await supabase
    .from("founders")
    .select("*")
    .eq("user_id", uid)
    .order("name");

  const items = (founders ?? []) as Founder[];

  return (
    <div className="flex min-h-full flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg)]/90 px-8 py-4 backdrop-blur-md">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-[var(--text)]">Founders</h1>
          <p className="mt-px text-[12px] text-[var(--muted)]">
            {items.length > 0
              ? `${items.length} founder${items.length !== 1 ? "s" : ""} on your radar`
              : "People worth tracking across deals and time"}
          </p>
        </div>
        <AddFounderButton variant="header" />
      </header>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[22px]">
            ◉
          </div>
          <h2 className="text-[14px] font-semibold text-[var(--text)]">No founders tracked</h2>
          <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-[var(--muted)]">
            Track exceptional founders across deals and time — long before they raise, or after you pass.
          </p>
          <div className="mt-6">
            <AddFounderButton />
          </div>
        </div>
      ) : (
        <div className="flex-1 px-8 py-6">
          <ul className="space-y-2">
            {items.map((founder) => (
              <li key={founder.id}>
                <Link
                  href={`/founders/${founder.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3.5 transition-all hover:border-[var(--accent)]/30 hover:bg-[var(--surface-raised)]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-[var(--text)]">{founder.name}</p>
                    {founder.notes && (
                      <p className="mt-0.5 truncate text-[12px] text-[var(--muted)]">{founder.notes}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {founder.twitter && (
                      <span className="text-[11px] text-[var(--muted)]">@{founder.twitter.replace(/^@/, "")}</span>
                    )}
                    {founder.linkedin && (
                      <span className="text-[11px] text-[var(--muted-2)]">LinkedIn</span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
