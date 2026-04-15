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
    <div className="flex min-h-full flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg)]/90 px-8 py-4 backdrop-blur-md">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-[var(--text)]">Feed</h1>
          <p className="mt-px text-[12px] text-[var(--muted)]">
            {items.length > 0
              ? `${items.length} signal${items.length !== 1 ? "s" : ""} · signals, observations, market notes`
              : "Your signal stream — tweets, articles, conversations, thoughts"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {items.length > 0 && <ExportButton clips={items} />}
          <AddClipButton />
        </div>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[22px]">
            ◎
          </div>
          <h2 className="text-[14px] font-semibold text-[var(--text)]">No signals yet</h2>
          <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-[var(--muted)]">
            A clip is any signal worth remembering — a tweet, article, conversation, or raw thought about a company or market.
          </p>
          <div className="mt-6">
            <AddClipButton />
          </div>
        </div>
      ) : (
        <div className="flex-1 px-8 py-6">
          <FeedClient clips={items} />
        </div>
      )}
    </div>
  );
}
