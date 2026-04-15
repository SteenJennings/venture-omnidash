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
    <div className="px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">Founders</h1>
          <p className="text-sm text-[var(--muted)]">
            {items.length} founder{items.length !== 1 ? "s" : ""} on your radar
          </p>
        </div>
        <AddFounderButton />
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
          <p className="text-sm font-medium text-[var(--text)]">No founders tracked</p>
          <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
            Track exceptional founders across deals and time —<br />
            long before they raise, or after you pass.
          </p>
          <p className="mt-4 text-xs text-[var(--muted)]">Use <span className="text-[var(--accent)]">+ Add founder</span> to get started.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((founder) => (
            <li key={founder.id}>
              <Link
                href={`/founders/${founder.id}`}
                className="flex items-start justify-between gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 hover:border-[var(--accent)]/40 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-[var(--text)]">
                    {founder.name}
                  </span>
                  <div className="mt-0.5 flex items-center gap-3">
                    {founder.twitter && (
                      <span className="text-xs text-[var(--muted)]">
                        @{founder.twitter.replace(/^@/, "")}
                      </span>
                    )}
                    {founder.linkedin && (
                      <span className="text-xs text-[var(--muted)] truncate">
                        LinkedIn
                      </span>
                    )}
                  </div>
                  {founder.notes && (
                    <p className="mt-1 truncate text-xs text-[var(--muted)]">
                      {founder.notes}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
