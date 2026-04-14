import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Thesis, Clip, Company } from "@/types/database.types";

export default async function ThesisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: thesis } = await supabase
    .from("theses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!thesis) notFound();

  const t = thesis as Thesis;

  // Linked clips via thesis_clips join
  const { data: clipLinks } = await supabase
    .from("thesis_clips")
    .select("clip_id")
    .eq("thesis_id", id);

  const clipIds = (clipLinks ?? []).map((r) => r.clip_id);

  const linkedClips: Clip[] = [];
  if (clipIds.length > 0) {
    const { data } = await supabase
      .from("clips")
      .select("*")
      .in("id", clipIds)
      .order("created_at", { ascending: false });
    linkedClips.push(...((data ?? []) as Clip[]));
  }

  // Linked companies via thesis_companies join
  const { data: companyLinks } = await supabase
    .from("thesis_companies")
    .select("company_id")
    .eq("thesis_id", id);

  const companyIds = (companyLinks ?? []).map((r) => r.company_id);

  const linkedCompanies: Company[] = [];
  if (companyIds.length > 0) {
    const { data } = await supabase
      .from("companies")
      .select("*")
      .in("id", companyIds);
    linkedCompanies.push(...((data ?? []) as Company[]));
  }

  const updated = new Date(t.updated_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const confidence = t.confidence;
  let confidenceLabel = "";
  let confidenceClass = "";
  if (confidence !== null) {
    if (confidence >= 80) {
      confidenceLabel = `High ${confidence}%`;
      confidenceClass = "bg-emerald-900/40 text-emerald-400";
    } else if (confidence >= 50) {
      confidenceLabel = `Mid ${confidence}%`;
      confidenceClass = "bg-amber-900/40 text-amber-400";
    } else {
      confidenceLabel = `Low ${confidence}%`;
      confidenceClass = "bg-[var(--border)] text-[var(--muted)]";
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      {/* Back */}
      <Link
        href="/theses"
        className="mb-6 inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
      >
        ← Theses
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold text-[var(--text)]">{t.title}</h1>
          {confidenceLabel && (
            <span
              className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${confidenceClass}`}
            >
              {confidenceLabel}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-[var(--muted)]">Updated {updated}</p>
      </div>

      {/* Description */}
      {t.description && (
        <section className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-sm leading-relaxed text-[var(--text)]">
            {t.description}
          </p>
        </section>
      )}

      {/* Linked companies */}
      {linkedCompanies.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
            Companies ({linkedCompanies.length})
          </h2>
          <ul className="space-y-2">
            {linkedCompanies.map((company) => (
              <li key={company.id}>
                <Link
                  href={`/companies/${company.id}`}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 hover:border-[var(--accent)]/40 transition-colors"
                >
                  <span className="text-sm text-[var(--text)]">
                    {company.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {company.stage && (
                      <span className="rounded bg-[var(--border)] px-1.5 py-0.5 text-xs text-[var(--muted)]">
                        {company.stage}
                      </span>
                    )}
                    {company.status && (
                      <span className="rounded bg-[var(--border)] px-1.5 py-0.5 text-xs text-[var(--muted)]">
                        {company.status}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
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
              Link clips to this thesis from the feed.
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
