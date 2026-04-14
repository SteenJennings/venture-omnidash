import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Company, Clip } from "@/types/database.types";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!company) notFound();

  const c = company as Company;

  // Clips linked to this company
  const { data: clips } = await supabase
    .from("clips")
    .select("*")
    .eq("company_id", id)
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const linkedClips = (clips ?? []) as Clip[];

  const updated = new Date(c.updated_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      {/* Back */}
      <Link
        href="/companies"
        className="mb-6 inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
      >
        ← Companies
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold text-[var(--text)]">{c.name}</h1>
          <div className="flex shrink-0 items-center gap-2">
            {c.stage && (
              <span className="rounded bg-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">
                {c.stage}
              </span>
            )}
            {c.status && (
              <span className="rounded bg-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">
                {c.status}
              </span>
            )}
          </div>
        </div>
        {c.sector && (
          <p className="mt-1 text-sm text-[var(--muted)]">{c.sector}</p>
        )}
        <p className="mt-1 text-xs text-[var(--muted)]">Updated {updated}</p>
      </div>

      {/* Thesis */}
      {c.thesis && (
        <section className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
            Thesis
          </h2>
          <p className="text-sm leading-relaxed text-[var(--text)]">{c.thesis}</p>
        </section>
      )}

      {/* Key unknowns */}
      {c.key_unknowns && (
        <section className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
            Key Unknowns
          </h2>
          <p className="text-sm leading-relaxed text-[var(--text)]">
            {c.key_unknowns}
          </p>
        </section>
      )}

      {/* Linked clips */}
      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
          Clips ({linkedClips.length})
        </h2>

        {linkedClips.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center">
            <p className="text-sm text-[var(--muted)]">No clips linked yet.</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Add a clip and link it to this company from the feed.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {linkedClips.map((clip) => {
              const date = new Date(clip.created_at).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" }
              );
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
