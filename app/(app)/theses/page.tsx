import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPageUser } from "@/lib/dev-user";
import type { Thesis } from "@/types/database.types";
import AddThesisButton from "./AddThesisButton";

export default async function ThesesPage() {
  const { id: uid } = await getPageUser();
  const supabase = await createClient();

  const { data: theses } = await supabase
    .from("theses")
    .select("*, thesis_clips(count)")
    .eq("user_id", uid)
    .order("updated_at", { ascending: false });

  const items = (theses ?? []) as (Thesis & { thesis_clips: { count: number }[] })[];

  return (
    <div className="flex min-h-full flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg)]/90 px-8 py-4 backdrop-blur-md">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-[var(--text)]">Theses</h1>
          <p className="mt-px text-[12px] text-[var(--muted)]">
            {items.length > 0
              ? `${items.length} thesis${items.length !== 1 ? "es" : ""} · investment beliefs built from evidence`
              : "Investment beliefs you want to build evidence for"}
          </p>
        </div>
        <AddThesisButton variant="header" />
      </header>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[22px]">
            ◇
          </div>
          <h2 className="text-[14px] font-semibold text-[var(--text)]">No theses yet</h2>
          <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-[var(--muted)]">
            A thesis is a falsifiable investment belief — the bet you're making and why. Great theses have clear evidence and a bear case.
          </p>
          <div className="mt-6">
            <AddThesisButton />
          </div>
        </div>
      ) : (
        <div className="flex-1 px-8 py-6">
          <ul className="space-y-2">
            {items.map((thesis) => {
              const clipCount = Number(thesis.thesis_clips?.[0]?.count ?? 0);
              return <ThesisRow key={thesis.id} thesis={thesis} clipCount={clipCount} />;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function ThesisRow({ thesis, clipCount }: { thesis: Thesis; clipCount: number }) {
  const confidence = thesis.confidence ?? null;
  const updated = new Date(thesis.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const confColor = confidence === null ? "text-[var(--muted)]"
    : confidence >= 80 ? "text-emerald-400"
    : confidence >= 50 ? "text-amber-400"
    : "text-[var(--muted)]";

  return (
    <li>
      <Link
        href={`/theses/${thesis.id}`}
        className="flex items-center justify-between gap-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 transition-all hover:border-[var(--accent)]/30 hover:bg-[var(--surface-raised)]"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium text-[var(--text)]">{thesis.title}</p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          {clipCount > 0 && (
            <span className="text-[11px] text-[var(--muted)]">{clipCount} clip{clipCount !== 1 ? "s" : ""}</span>
          )}
          {confidence !== null && (
            <span className={`text-[12px] font-semibold tabular-nums ${confColor}`}>{confidence}%</span>
          )}
          <span className="text-[11px] text-[var(--muted-2)]">{updated}</span>
        </div>
      </Link>
    </li>
  );
}
