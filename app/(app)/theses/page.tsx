import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPageUser } from "@/lib/dev-user";
import type { Thesis } from "@/types/database.types";
import AddThesisButton from "./AddThesisButton";

export default async function ThesesPage() {
  const { id: uid } = await getPageUser();
  const supabase = await createClient();

  // Fetch theses + clip counts via thesis_clips join
  const { data: theses } = await supabase
    .from("theses")
    .select("*, thesis_clips(count)")
    .eq("user_id", uid)
    .order("updated_at", { ascending: false });

  const items = (theses ?? []) as (Thesis & {
    thesis_clips: { count: number }[];
  })[];

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">Theses</h1>
          <p className="text-sm text-[var(--muted)]">
            {items.length} tha{items.length !== 1 ? "ses" : "sis"}
          </p>
        </div>
        <AddThesisButton />
      </div>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-3">
          {items.map((thesis) => {
            const clipCount =
              Number(thesis.thesis_clips?.[0]?.count ?? 0);
            return (
              <ThesisCard
                key={thesis.id}
                thesis={thesis}
                clipCount={clipCount}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ThesisCard({
  thesis,
  clipCount,
}: {
  thesis: Thesis;
  clipCount: number;
}) {
  const updated = new Date(thesis.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const confidence = thesis.confidence ?? null;

  return (
    <li>
      <Link
        href={`/theses/${thesis.id}`}
        className="block rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--accent)]/40 transition-colors"
      >
      <div className="mb-2 flex items-start justify-between gap-4">
        <h3 className="font-medium text-[var(--text)]">{thesis.title}</h3>
        <div className="flex shrink-0 items-center gap-2">
          {confidence !== null && (
            <ConfidenceBadge confidence={confidence} />
          )}
          {clipCount > 0 && (
            <span className="text-xs text-[var(--muted)]">
              {clipCount} clip{clipCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {thesis.description && (
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          {thesis.description}
        </p>
      )}

      <p className="mt-3 text-xs text-[var(--muted)]">Updated {updated}</p>
      </Link>
    </li>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  let color = "bg-[var(--border)] text-[var(--muted)]";
  let label = "Low";

  if (confidence >= 80) {
    color = "bg-emerald-900/40 text-emerald-400";
    label = "High";
  } else if (confidence >= 50) {
    color = "bg-amber-900/40 text-amber-400";
    label = "Mid";
  }

  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${color}`}>
      {label} {confidence}%
    </span>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
      <p className="text-sm text-[var(--muted)]">No theses yet.</p>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Capture your investment hypotheses here.
      </p>
    </div>
  );
}
