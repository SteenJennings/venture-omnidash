import { createClient } from "@/lib/supabase/server";
import { getPageUser } from "@/lib/dev-user";
import type { Clip } from "@/types/database.types";
import AddClipButton from "./AddClipButton";
import FeedClient from "./FeedClient";
import ExportButton from "./ExportButton";

export default async function FeedPage() {
  const { id: uid } = await getPageUser();
  const supabase = await createClient();

  const { data: clips } = await supabase
    .from("clips")
    .select("*")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });

  const items = (clips ?? []) as Clip[];

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">Feed</h1>
          <p className="text-sm text-[var(--muted)]">
            {items.length} clip{items.length !== 1 ? "s" : ""} · signals, observations, and market notes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton clips={items} />
          <AddClipButton />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
          <p className="text-sm font-medium text-[var(--text)]">No signals yet</p>
          <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
            A clip is any signal worth remembering — a tweet, article,<br />
            conversation, or raw thought about a company or market.
          </p>
          <p className="mt-4 text-xs text-[var(--muted)]">Use the <span className="text-[var(--accent)]">+ Add clip</span> button above to start.</p>
        </div>
      ) : (
        <FeedClient clips={items} />
      )}
    </div>
  );
}
