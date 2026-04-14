import { createClient } from "@/lib/supabase/server";
import type { Clip } from "@/types/database.types";
import AddClipButton from "./AddClipButton";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: clips } = await supabase
    .from("clips")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const items = (clips ?? []) as Clip[];

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">Feed</h1>
          <p className="text-sm text-[var(--muted)]">
            {items.length} clip{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <AddClipButton />
      </div>

      {/* Clips */}
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-3">
          {items.map((clip) => (
            <ClipCard key={clip.id} clip={clip} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ClipCard({ clip }: { clip: Clip }) {
  const date = new Date(clip.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <li className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="text-sm leading-relaxed text-[var(--text)]">{clip.note}</p>
        <span className="shrink-0 rounded bg-[var(--border)] px-1.5 py-0.5 text-xs text-[var(--muted)]">
          {clip.source_type}
        </span>
      </div>

      {clip.url && (
        <a
          href={clip.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-2 block truncate text-xs text-[var(--muted)] hover:text-[var(--accent)]"
        >
          {clip.url}
        </a>
      )}

      {clip.tags && clip.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {clip.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[var(--bg)] px-2 py-0.5 text-xs text-[var(--muted)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-[var(--muted)]">{date}</p>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
      <p className="text-sm text-[var(--muted)]">No clips yet.</p>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Add your first clip to start tracking signals.
      </p>
    </div>
  );
}
