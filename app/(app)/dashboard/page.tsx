import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPageUser } from "@/lib/dev-user";
import type { Clip, Company, Thesis } from "@/types/database.types";
import AddClipButton from "../feed/AddClipButton";

export default async function DashboardPage() {
  const { id: uid } = await getPageUser();
  const supabase = await createClient();

  // Parallel fetches
  const [
    { count: clipCount },
    { count: companyCount },
    { count: thesisCount },
    { count: founderCount },
    { count: dealCount },
    { data: recentClips },
    { data: recentCompanies },
    { data: allTheses },
  ] = await Promise.all([
    supabase.from("clips").select("*", { count: "exact", head: true }).eq("user_id", uid),
    supabase.from("companies").select("*", { count: "exact", head: true }).eq("user_id", uid),
    supabase.from("theses").select("*", { count: "exact", head: true }).eq("user_id", uid),
    supabase.from("founders").select("*", { count: "exact", head: true }).eq("user_id", uid),
    supabase.from("deals").select("*", { count: "exact", head: true }).eq("user_id", uid).not("stage", "in", "(passed,invested)"),
    supabase.from("clips").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(5),
    supabase.from("companies").select("*").eq("user_id", uid).order("updated_at", { ascending: false }).limit(5),
    supabase.from("theses").select("*").eq("user_id", uid).order("confidence", { ascending: false }),
  ]);

  const clips = (recentClips ?? []) as Clip[];
  const companies = (recentCompanies ?? []) as Company[];
  const theses = (allTheses ?? []) as Thesis[];

  // Stalest company (oldest updated_at)
  const stalest = companies.length > 0
    ? [...companies].sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())[0]
    : null;

  const daysSince = stalest
    ? Math.floor((Date.now() - new Date(stalest.updated_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">Dashboard</h1>
          <p className="text-sm text-[var(--muted)]">Your research at a glance</p>
        </div>
        <AddClipButton />
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Clips" value={clipCount ?? 0} href="/feed" />
        <StatCard label="Companies" value={companyCount ?? 0} href="/companies" />
        <StatCard label="Active Deals" value={dealCount ?? 0} href="/deals" accent />
        <StatCard label="Theses" value={thesisCount ?? 0} href="/theses" />
        <StatCard label="Founders" value={founderCount ?? 0} href="/founders" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent clips */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
              Recent clips
            </h2>
            <Link href="/feed" className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
              View all →
            </Link>
          </div>
          {clips.length === 0 ? (
            <EmptyCard message="No clips yet." cta="Add your first clip" href="/feed" />
          ) : (
            <ul className="space-y-2">
              {clips.map((clip) => (
                <li key={clip.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                  <p className="line-clamp-2 text-xs text-[var(--text)]">{clip.note}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="rounded bg-[var(--border)] px-1.5 py-0.5 text-xs text-[var(--muted)]">
                      {clip.source_type}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      {new Date(clip.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Companies + thesis column */}
        <div className="space-y-6">
          {/* Recent companies */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
                Companies
              </h2>
              <Link href="/companies" className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
                View all →
              </Link>
            </div>
            {companies.length === 0 ? (
              <EmptyCard message="No companies yet." cta="Add one" href="/companies" />
            ) : (
              <ul className="space-y-2">
                {companies.slice(0, 3).map((company) => (
                  <li key={company.id}>
                    <Link
                      href={`/companies/${company.id}`}
                      className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 hover:border-[var(--accent)]/40 transition-colors"
                    >
                      <span className="text-xs font-medium text-[var(--text)]">{company.name}</span>
                      <span className="rounded bg-[var(--border)] px-1.5 py-0.5 text-xs text-[var(--muted)]">
                        {company.status ?? "tracking"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Theses */}
          {theses.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
                  Top theses
                </h2>
                <Link href="/theses" className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
                  View all →
                </Link>
              </div>
              <ul className="space-y-2">
                {theses.slice(0, 3).map((thesis) => (
                  <li key={thesis.id}>
                    <Link
                      href={`/theses/${thesis.id}`}
                      className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 hover:border-[var(--accent)]/40 transition-colors"
                    >
                      <span className="truncate text-xs font-medium text-[var(--text)]">{thesis.title}</span>
                      {thesis.confidence !== null && (
                        <span className={`ml-2 shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${
                          thesis.confidence >= 80 ? "bg-emerald-900/40 text-emerald-400" :
                          thesis.confidence >= 50 ? "bg-amber-900/40 text-amber-400" :
                          "bg-[var(--border)] text-[var(--muted)]"
                        }`}>
                          {thesis.confidence}%
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {/* Staleness alert */}
      {stalest && daysSince >= 7 && (
        <div className="mt-6 rounded-lg border border-amber-800/30 bg-amber-900/10 px-4 py-3">
          <p className="text-xs text-amber-400">
            <span className="font-medium">{stalest.name}</span> hasn&apos;t been updated in {daysSince} days.{" "}
            <Link href={`/companies/${stalest.id}`} className="underline hover:text-amber-300">
              Review it →
            </Link>
          </p>
        </div>
      )}

      {/* Getting started (empty state) */}
      {(clipCount ?? 0) === 0 && (
        <div className="mt-8 rounded-lg border border-dashed border-[var(--border)] p-8">
          <h2 className="mb-4 text-sm font-medium text-[var(--text)]">Getting started</h2>
          <ol className="space-y-3 text-sm text-[var(--muted)]">
            <li className="flex gap-3">
              <span className="font-mono text-[var(--accent)]">1.</span>
              <span>
                <Link href="/theses" className="text-[var(--text)] hover:text-[var(--accent)]">Add a thesis</Link>
                {" "}— an investment belief you want to build evidence for
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-[var(--accent)]">2.</span>
              <span>
                <Link href="/companies" className="text-[var(--text)] hover:text-[var(--accent)]">Track a company</Link>
                {" "}that fits your thesis
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-[var(--accent)]">3.</span>
              <span>Add a clip — a tweet, article, or observation that signals something
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-[var(--accent)]">4.</span>
              <span>Link clips to your thesis to build conviction bottom-up</span>
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, href, accent }: { label: string; value: number; href: string; accent?: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-lg border px-4 py-4 transition-colors ${
        accent
          ? "border-[var(--accent)]/30 bg-[var(--accent)]/5 hover:border-[var(--accent)]/50"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/40"
      }`}
    >
      <p className={`text-2xl font-semibold ${accent ? "text-[var(--accent)]" : "text-[var(--text)]"}`}>{value}</p>
      <p className="mt-0.5 text-xs text-[var(--muted)]">{label}</p>
    </Link>
  );
}

function EmptyCard({ message, cta, href }: { message: string; cta: string; href: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border)] px-4 py-6 text-center">
      <p className="text-xs text-[var(--muted)]">{message}</p>
      <Link href={href} className="mt-1 block text-xs text-[var(--accent)] hover:underline">
        {cta}
      </Link>
    </div>
  );
}
