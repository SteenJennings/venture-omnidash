import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPageUser } from "@/lib/dev-user";
import type { Company, Clip } from "@/types/database.types";
import CompanyActions from "./CompanyActions";
import ExportCompanyButton from "./ExportCompanyButton";
import CompanyLogoServer from "./CompanyLogoServer";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { id: uid } = await getPageUser();
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .eq("user_id", uid)
    .single();

  if (!company) notFound();

  const c = company as Company;

  // Clips linked to this company
  const { data: clips } = await supabase
    .from("clips")
    .select("*")
    .eq("company_id", id)
    .eq("user_id", uid)
    .order("created_at", { ascending: false });

  const linkedClips = (clips ?? []) as Clip[];

  const updated = new Date(c.updated_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="px-8 py-8">
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
          <div className="flex items-center gap-4 min-w-0">
            <CompanyLogoServer name={c.name} website={c.website} />
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-[var(--text)]">{c.name}</h1>
              {c.sector && (
                <p className="mt-0.5 text-sm text-[var(--muted)]">{c.sector}</p>
              )}
            </div>
          </div>
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
            <ExportCompanyButton company={c} clips={linkedClips} />
          </div>
        </div>

        {/* Links row */}
        {(c.website || c.linkedin) && (
          <div className="mt-3 flex items-center gap-4">
            {c.website && (
              <a
                href={c.website.startsWith("http") ? c.website : `https://${c.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 15 15" fill="none"><path d="M7.5 1a6.5 6.5 0 1 0 0 13A6.5 6.5 0 0 0 7.5 1Zm0 1c.36 0 .9.4 1.37 1.37.26.53.48 1.2.62 2H5.51c.14-.8.36-1.47.62-2C6.6 2.4 7.14 2 7.5 2Zm-1.7.22C5.37 2.83 5 3.82 4.77 5H3.1A5.52 5.52 0 0 1 5.8 2.22ZM9.2 2.22A5.52 5.52 0 0 1 11.9 5h-1.67C9.99 3.82 9.63 2.83 9.2 2.22ZM2.72 6H4.6c-.06.48-.1.98-.1 1.5s.04 1.02.1 1.5H2.72A5.48 5.48 0 0 1 2 7.5c0-.53.25-1.03.72-1.5Zm3.4 0h2.76c.07.47.12.97.12 1.5s-.05 1.03-.12 1.5H6.12A13.3 13.3 0 0 1 6 7.5c0-.53.05-1.03.12-1.5Zm3.28 0h1.88c.47.47.72.97.72 1.5a5.48 5.48 0 0 1-.72 1.5H9.4c.06-.48.1-.98.1-1.5s-.04-1.02-.1-1.5ZM3.1 10h1.67c.23 1.18.6 2.17 1.03 2.78A5.52 5.52 0 0 1 3.1 10Zm2.41 0h3.98c-.14.8-.36 1.47-.62 2-.47.97-1.01 1.37-1.37 1.37s-.9-.4-1.37-1.37c-.26-.53-.48-1.2-.62-2Zm4.74 0h1.65a5.52 5.52 0 0 1-2.68 2.78C9.64 12.17 10 11.18 10.25 10Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/></svg>
                {c.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            {c.linkedin && (
              <a
                href={c.linkedin.startsWith("http") ? c.linkedin : `https://${c.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 15 15" fill="none"><path d="M2 1a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2Zm1.5 3.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 1.5H2v6.5h1.5V6Zm2 0H4v6.5h1.5V9.5c0-1 .5-1.5 1.25-1.5S8 8.5 8 9.5v3H9.5V9c0-1.75-1-2.5-2.25-2.5-.75 0-1.25.25-1.75.75V6Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/></svg>
                LinkedIn
              </a>
            )}
          </div>
        )}

        <p className="mt-2 text-xs text-[var(--muted)]">Updated {updated}</p>
        <CompanyActions company={c} />
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
