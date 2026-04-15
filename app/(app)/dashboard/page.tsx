import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPageUser } from "@/lib/dev-user";
import type { Clip, Company, Thesis } from "@/types/database.types";
import AddClipButton from "../feed/AddClipButton";

export default async function DashboardPage() {
  const { id: uid, email } = await getPageUser();
  const supabase = await createClient();

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

  const stalest = companies.length > 0
    ? [...companies].sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())[0]
    : null;
  const daysSince = stalest
    ? Math.floor((Date.now() - new Date(stalest.updated_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const isEmpty = (clipCount ?? 0) === 0 && (companyCount ?? 0) === 0 && (thesisCount ?? 0) === 0;
  const firstName = email ? email.split("@")[0].split(".")[0] : "";
  const greeting = firstName ? `Good to see you, ${firstName}.` : "Good to see you.";

  return (
    <div>
      {/* Top bar */}
      <div className="border-b border-[var(--border-subtle)] px-8 py-5">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight text-[var(--text)]">{greeting}</h1>
            <p className="mt-0.5 text-[13px] text-[var(--muted)]">
              {isEmpty
                ? "Start building your research base."
                : `${clipCount ?? 0} signal${(clipCount ?? 0) !== 1 ? "s" : ""} across ${companyCount ?? 0} ${(companyCount ?? 0) !== 1 ? "companies" : "company"} and ${thesisCount ?? 0} ${(thesisCount ?? 0) !== 1 ? "theses" : "thesis"}.`}
            </p>
          </div>
          <AddClipButton />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-8 py-8 space-y-8">

        {/* Stat strip */}
        <div className="grid grid-cols-5 gap-3">
          <StatCard label="Clips" value={clipCount ?? 0} href="/feed" icon="◎" />
          <StatCard label="Companies" value={companyCount ?? 0} href="/companies" icon="⬡" />
          <StatCard label="Active Deals" value={dealCount ?? 0} href="/deals" icon="◈" accent />
          <StatCard label="Theses" value={thesisCount ?? 0} href="/theses" icon="◇" />
          <StatCard label="Founders" value={founderCount ?? 0} href="/founders" icon="◉" />
        </div>

        {/* Staleness alert */}
        {stalest && daysSince >= 7 && (
          <div className="flex items-center justify-between rounded-lg border border-amber-800/25 bg-amber-900/8 px-4 py-3">
            <p className="text-[13px] text-amber-400/90">
              <span className="font-medium">{stalest.name}</span> hasn&apos;t been updated in {daysSince} days — going cold?
            </p>
            <Link href={`/companies/${stalest.id}`} className="ml-4 shrink-0 text-[12px] text-amber-400 underline-offset-2 hover:underline">
              Review →
            </Link>
          </div>
        )}

        {isEmpty ? (
          /* Onboarding */
          <OnboardingChecklist clipCount={clipCount ?? 0} companyCount={companyCount ?? 0} thesisCount={thesisCount ?? 0} />
        ) : (
          /* Main grid */
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent clips */}
            <Section
              title="Recent signals"
              href="/feed"
              cta="View all"
            >
              {clips.length === 0 ? (
                <EmptyState message="No clips yet." cta="Add your first signal" href="/feed" />
              ) : (
                <ul className="space-y-2">
                  {clips.map((clip) => (
                    <li key={clip.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition-colors hover:border-[var(--border-subtle)]/60">
                      <p className="line-clamp-2 text-[13px] leading-relaxed text-[var(--text)]">{clip.note}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <SourceBadge type={clip.source_type} />
                        <span className="text-[11px] text-[var(--muted)]">
                          {new Date(clip.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            {/* Right column */}
            <div className="space-y-6">
              {/* Companies */}
              <Section title="Companies" href="/companies" cta="View all">
                {companies.length === 0 ? (
                  <EmptyState message="No companies tracked yet." cta="Add one" href="/companies" />
                ) : (
                  <ul className="space-y-1.5">
                    {companies.slice(0, 4).map((company) => (
                      <li key={company.id}>
                        <Link
                          href={`/companies/${company.id}`}
                          className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 transition-all hover:border-[var(--accent)]/20 hover:bg-[var(--accent-glow)]"
                        >
                          <span className="text-[13px] font-medium text-[var(--text)]">{company.name}</span>
                          <StatusBadge status={company.status} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              {/* Theses */}
              {theses.length > 0 && (
                <Section title="Top theses" href="/theses" cta="View all">
                  <ul className="space-y-1.5">
                    {theses.slice(0, 3).map((thesis) => (
                      <li key={thesis.id}>
                        <Link
                          href={`/theses/${thesis.id}`}
                          className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 transition-all hover:border-[var(--accent)]/20 hover:bg-[var(--accent-glow)]"
                        >
                          <span className="truncate text-[13px] font-medium text-[var(--text)]">{thesis.title}</span>
                          {thesis.confidence !== null && (
                            <ConfidencePill value={thesis.confidence} />
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function StatCard({
  label, value, href, icon, accent,
}: {
  label: string; value: number; href: string; icon: string; accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-xl border px-4 py-4 transition-all duration-150 ${
        accent
          ? "border-[var(--accent)]/20 bg-[var(--accent-glow)] hover:border-[var(--accent)]/40"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-subtle)] hover:bg-[var(--surface-raised)]"
      }`}
    >
      <span className={`mb-2 block text-[18px] leading-none ${accent ? "text-[var(--accent)]" : "text-[var(--muted-2)]"}`}>
        {icon}
      </span>
      <p className={`text-[22px] font-semibold tabular-nums tracking-tight ${accent ? "text-[var(--accent)]" : "text-[var(--text)]"}`}>
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-[var(--muted)]">{label}</p>
    </Link>
  );
}

function Section({
  title, href, cta, children,
}: {
  title: string; href: string; cta: string; children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)]">{title}</h2>
        <Link href={href} className="text-[11px] text-[var(--muted)] transition-colors hover:text-[var(--accent)]">
          {cta} →
        </Link>
      </div>
      {children}
    </section>
  );
}

function EmptyState({ message, cta, href }: { message: string; cta: string; href: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border)] px-4 py-5 text-center">
      <p className="text-[13px] text-[var(--muted)]">{message}</p>
      <Link href={href} className="mt-1.5 inline-block text-[13px] text-[var(--accent)] hover:underline">
        {cta}
      </Link>
    </div>
  );
}

function SourceBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    tweet: "bg-sky-900/40 text-sky-400",
    article: "bg-purple-900/40 text-purple-400",
    conversation: "bg-emerald-900/40 text-emerald-400",
    thought: "bg-[var(--border)] text-[var(--muted)]",
  };
  const cls = map[type] ?? "bg-[var(--border)] text-[var(--muted)]";
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${cls}`}>{type}</span>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, string> = {
    watching: "bg-[var(--border)] text-[var(--muted)]",
    tracking: "bg-sky-900/40 text-sky-400",
    diligence: "bg-amber-900/40 text-amber-400",
    passed: "bg-[var(--border)] text-[var(--muted-2)]",
    invested: "bg-emerald-900/40 text-emerald-400",
  };
  const s = status ?? "watching";
  const cls = map[s] ?? "bg-[var(--border)] text-[var(--muted)]";
  return <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${cls}`}>{s}</span>;
}

function ConfidencePill({ value }: { value: number }) {
  const cls =
    value >= 80 ? "bg-emerald-900/40 text-emerald-400" :
    value >= 50 ? "bg-amber-900/40 text-amber-400" :
    "bg-[var(--border)] text-[var(--muted)]";
  return <span className={`ml-2 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${cls}`}>{value}%</span>;
}

function OnboardingChecklist({
  clipCount, companyCount, thesisCount,
}: {
  clipCount: number; companyCount: number; thesisCount: number;
}) {
  const steps = [
    {
      n: 1,
      done: thesisCount > 0,
      label: "Add a thesis",
      desc: "An investment belief you want to build evidence for",
      href: "/theses",
      cta: "Go to Theses →",
    },
    {
      n: 2,
      done: companyCount > 0,
      label: "Track a company",
      desc: "A company that fits your thesis",
      href: "/companies",
      cta: "Go to Companies →",
    },
    {
      n: 3,
      done: clipCount > 0,
      label: "Add your first clip",
      desc: "A tweet, article, or observation that signals something",
      href: "/feed",
      cta: "Open Feed →",
    },
    {
      n: 4,
      done: false,
      label: "Link clips to your thesis",
      desc: "Build conviction bottom-up from evidence",
      href: "/theses",
      cta: "Go to Theses →",
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-semibold text-[var(--text)]">Get started</h2>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">{doneCount} of {steps.length} steps complete</p>
        </div>
        {/* Progress bar */}
        <div className="w-32 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
      </div>
      <ul className="divide-y divide-[var(--border)]">
        {steps.map((step) => (
          <li key={step.n} className={`flex items-start gap-4 px-6 py-4 ${step.done ? "opacity-50" : ""}`}>
            <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
              step.done ? "bg-[var(--accent)] text-black" : "border border-[var(--border)] text-[var(--muted)]"
            }`}>
              {step.done ? "✓" : step.n}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[13px] font-medium ${step.done ? "line-through text-[var(--muted)]" : "text-[var(--text)]"}`}>
                {step.label}
              </p>
              <p className="mt-0.5 text-[12px] text-[var(--muted)]">{step.desc}</p>
            </div>
            {!step.done && (
              <Link
                href={step.href}
                className="shrink-0 text-[12px] text-[var(--accent)] hover:underline"
              >
                {step.cta}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
