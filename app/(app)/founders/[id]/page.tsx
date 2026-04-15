import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPageUser } from "@/lib/dev-user";
import type { Founder, Clip } from "@/types/database.types";
import FounderActions from "./FounderActions";

export default async function FounderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { id: uid } = await getPageUser();
  const supabase = await createClient();

  const { data: founder } = await supabase
    .from("founders")
    .select("*")
    .eq("id", id)
    .eq("user_id", uid)
    .single();

  if (!founder) notFound();

  const f = founder as Founder;

  const { data: clips } = await supabase
    .from("clips")
    .select("*")
    .eq("founder_id", id)
    .eq("user_id", uid)
    .order("created_at", { ascending: false });

  const linkedClips = (clips ?? []) as Clip[];

  const since = new Date(f.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="px-8 py-8">
      <Link
        href="/founders"
        className="mb-6 inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
      >
        ← Founders
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--text)]">{f.name}</h1>
        <div className="mt-1 flex items-center gap-3">
          {f.twitter && (
            <a
              href={`https://twitter.com/${f.twitter.replace(/^@/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
            >
              @{f.twitter.replace(/^@/, "")}
            </a>
          )}
          {f.linkedin && (
            <a
              href={f.linkedin.startsWith("http") ? f.linkedin : `https://${f.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
            >
              LinkedIn
            </a>
          )}
          <span className="text-xs text-[var(--muted)]">Since {since}</span>
        </div>
        <FounderActions founder={f} />
      </div>

      {f.notes && (
        <section className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-sm leading-relaxed text-[var(--text)]">{f.notes}</p>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
          Clips ({linkedClips.length})
        </h2>

        {linkedClips.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center">
            <p className="text-sm text-[var(--muted)]">No clips linked yet.</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Tag this founder when adding a clip.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {linkedClips.map((clip) => {
              const date = new Date(clip.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              return (
                <li
                  key={clip.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <p className="text-sm leading-relaxed text-[var(--text)]">
                      {clip.note}
                    </p>
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
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
