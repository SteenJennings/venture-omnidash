import { createClient } from "@/lib/supabase/server";
import type { Clip } from "@/types/database.types";
import AddClipButton from "./AddClipButton";
import FeedClient from "./FeedClient";

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

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
          <p className="text-sm text-[var(--muted)]">No clips yet.</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Add your first clip to start tracking signals.
          </p>
        </div>
      ) : (
        <FeedClient clips={items} />
      )}
    </div>
  );
}
