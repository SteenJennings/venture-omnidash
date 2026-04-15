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
    supabase.from("clips").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(8),
    supabase.from("companies").select("*").eq("user_id", uid).order("updated_at", { ascending: false }).limit(6),
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
  const handle = email ? email.split("@")[0] : "";

  return (
    <div className="flex min-h-full flex-col">

      {/* ── Sticky top bar ─────────────────────────────────────── */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg)]/80 px-8 py-4 backdrop-blur-md">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-[var(--text)]">
            {handle ? `Good to see you, ${handle}.` : "Dashboard"}
          </h1>
          <p className="mt-px text-[12px] text-[var(--muted)]">
            {isEmpty
              ? "Start building your research base below."
              : `${clipCount ?? 0} signal${(clipCount ?? 0) !== 1 ? "s" : ""} · ${companyCount ?? 0} ${(companyCount ?? 0) !== 1 ? "companies" : "company"} · ${thesisCount ?? 0} ${(thesisCount ?? 0) !== 1 ? "theses" : "thesis"}`}
          </p>
        </div>
        <AddClipButton variant="header" />
      </header>

      {/* ── Stat strip ─────────────────────────────────────────── */}
      <div className="grid grid-cols-5 divide-x divide-[var(--border-subtle)] border-b border-[var(--border-subtle)]">
        <StatCell label="Clips" value={clipCount ?? 0} href="/feed" first />
        <StatCell label="Companies" value={companyCount ?? 0} href="/companies" />
        <StatCell label="Active Deals" value={dealCount ?? 0} href="/deals" accent />
        <StatCell label="Theses" value={thesisCount ?? 0} href="/theses" />
        <StatCell label="Founders" value={founderCount ?? 0} href="/founders" last />
      </div>

      {/* ── Alert ──────────────────────────────────────────────── */}
      {stalest && daysSince >= 7 && (
        <div className="mx-6 mt-4 flex items-center justify-between rounded-lg border border-amber-800/25 bg-amber-950/30 px-4 py-2.5">
          <p className="text-[12px] text-amber-400/90">
            <span className="font-medium">{stalest.name}</span> hasn&apos;t been updated in {daysSince} days.
          </p>
          <Link href={`/companies/${stalest.id}`} className="ml-4 shrink-0 text-[12px] text-amber-400 hover:underline">
            Review →
          </Link>
        </div>
      )}

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="flex flex-1 flex-col">
        {isEmpty ? (
          <div className="flex flex-1 items-center justify-center px-8 py-12">
            <OnboardingChecklist
              clipCount={clipCount ?? 0}
              companyCount={companyCount ?? 0}
              thesisCount={thesisCount ?? 0}
            />
          </div>
        ) : (
          <div className="grid flex-1 grid-cols-[1fr_320px] divide-x divide-[var(--border-subtle)]">

            {/* Left — signal feed */}
            <div className="min-w-0 px-8 py-8">
              <SectionHeader title="Recent signals" href="/feed" cta="View all" />
              {clips.length === 0 ? (
                <BlankSlate message="No signals captured yet." cta="Add your first clip" href="/feed" />
              ) : (
                <div className="mt-4 space-y-2">
                  {clips.map((clip) => (
                    <ClipRow key={clip.id} clip={clip} />
                  ))}
                </div>
              )}
            </div>

            {/* Right panel */}
            <div className="flex flex-col divide-y divide-[var(--border-subtle)]">

              {/* Companies */}
              <div className="px-6 py-6 pr-8">
                <SectionHeader title="Companies" href="/companies" cta="View all" />
                {companies.length === 0 ? (
                  <BlankSlate message="No companies tracked." cta="Add one" href="/companies" />
                ) : (
                  <ul className="mt-4 space-y-1">
                    {companies.slice(0, 5).map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/companies/${c.id}`}
                          className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.03]"
                        >
                          <span className="text-[13px] font-medium text-[var(--text)]">{c.name}</span>
                          <StatusBadge status={c.status} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Theses */}
              <div className="px-6 py-6 pr-8">
                <SectionHeader title="Theses" href="/theses" cta="View all" />
                {theses.length === 0 ? (
                  <BlankSlate message="No theses yet." cta="Add one" href="/theses" />
                ) : (
                  <ul className="mt-4 space-y-1">
                    {theses.slice(0, 4).map((t) => (
                      <li key={t.id}>
                        <Link
                          href={`/theses/${t.id}`}
                          className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.03]"
                        >
                          <span className="truncate text-[13px] font-medium text-[var(--text)]">{t.title}</span>
                          {t.confidence !== null && <ConfidencePill value={t.confidence} />}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Founders */}
              <div className="px-6 py-6 pr-8">
                <SectionHeader title="Founders" href="/founders" cta="View all" />
                <p className="mt-2 text-[12px] text-[var(--muted)]">
                  {(founderCount ?? 0) > 0
                    ? `${founderCount} founder${(founderCount ?? 0) !== 1 ? "s" : ""} tracked`
                    : "No founders tracked yet."}
                </p>
                {(founderCount ?? 0) === 0 && (
                  <Link href="/founders" className="mt-1 inline-block text-[12px] text-[var(--accent)] hover:underline">
                    Add one
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Components ─────────────────────────────────────────────────────────── */

function StatCell({ label, value, href, accent, first, last }: { label: string; value: number; href: string; accent?: boolean; first?: boolean; last?: boolean }) {
  return (
    <Link
      href={href}
      className={`group flex flex-col py-5 transition-colors ${
        first ? "pl-8 pr-6" : last ? "pl-6 pr-8" : "px-6"
      } ${
        accent
          ? "bg-[var(--accent-glow)] hover:bg-amber-950/30"
          : "hover:bg-white/[0.02]"
      }`}
    >
      <span className={`text-[28px] font-semibold tabular-nums leading-none tracking-tight ${accent ? "text-[var(--accent)]" : "text-[var(--text)]"}`}>
        {value}
      </span>
      <span className={`mt-2 text-[11px] font-medium tracking-wide ${accent ? "text-amber-500/70" : "text-[var(--muted)]"}`}>
        {label.toUpperCase()}
      </span>
    </Link>
  );
}

function SectionHeader({ title, href, cta }: { title: string; href: string; cta: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)]">{title}</h2>
      <Link href={href} className="text-[11px] text-[var(--muted)] transition-colors hover:text-[var(--accent)]">
        {cta} →
      </Link>
    </div>
  );
}

function ClipRow({ clip }: { clip: Clip }) {
  return (
    <div className="group rounded-xl border border-transparent px-4 py-3 transition-all hover:border-[var(--border)] hover:bg-[var(--surface)]">
      <p className="line-clamp-2 text-[13px] leading-relaxed text-[var(--text)]">{clip.note}</p>
      <div className="mt-2 flex items-center gap-2">
        <SourceBadge type={clip.source_type} />
        <span className="text-[11px] text-[var(--muted-2)]">
          {new Date(clip.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>
    </div>
  );
}

function BlankSlate({ message, cta, href }: { message: string; cta: string; href: string }) {
  return (
    <div className="mt-4 rounded-lg border border-dashed border-[var(--border)] px-4 py-6 text-center">
      <p className="text-[12px] text-[var(--muted)]">{message}</p>
      <Link href={href} className="mt-1.5 inline-block text-[12px] text-[var(--accent)] hover:underline">
        {cta}
      </Link>
    </div>
  );
}

function SourceBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    tweet: "bg-sky-900/40 text-sky-400",
    article: "bg-violet-900/40 text-violet-400",
    conversation: "bg-emerald-900/40 text-emerald-400",
    thought: "bg-[var(--border)] text-[var(--muted)]",
  };
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${styles[type] ?? "bg-[var(--border)] text-[var(--muted)]"}`}>
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const styles: Record<string, string> = {
    watching: "text-[var(--muted)]",
    tracking: "text-sky-400",
    diligence: "text-amber-400",
    passed: "text-[var(--muted-2)]",
    invested: "text-emerald-400",
  };
  const s = status ?? "watching";
  return (
    <span className={`ml-2 shrink-0 text-[11px] font-medium capitalize ${styles[s] ?? "text-[var(--muted)]"}`}>
      {s}
    </span>
  );
}

function ConfidencePill({ value }: { value: number }) {
  const cls = value >= 80 ? "text-emerald-400" : value >= 50 ? "text-amber-400" : "text-[var(--muted)]";
  return <span className={`ml-2 shrink-0 text-[11px] font-medium tabular-nums ${cls}`}>{value}%</span>;
}

function OnboardingChecklist({ clipCount, companyCount, thesisCount }: { clipCount: number; companyCount: number; thesisCount: number }) {
  const steps = [
    { n: 1, done: thesisCount > 0, label: "Add a thesis", desc: "An investment belief you want to build evidence for", href: "/theses", cta: "Go to Theses →" },
    { n: 2, done: companyCount > 0, label: "Track a company", desc: "A company that fits your thesis", href: "/companies", cta: "Go to Companies →" },
    { n: 3, done: clipCount > 0, label: "Add your first clip", desc: "A tweet, article, or observation that signals something", href: "/feed", cta: "Open Feed →" },
    { n: 4, done: false, label: "Link clips to a thesis", desc: "Build conviction bottom-up from evidence", href: "/theses", cta: "Go to Theses →" },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="border-b border-[var(--border)] px-6 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-[var(--text)]">Get started</h2>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">{doneCount} of {steps.length} complete</p>
        </div>
        <div className="w-28 h-1 rounded-full bg-[var(--border)] overflow-hidden">
          <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
        </div>
      </div>
      <ul className="divide-y divide-[var(--border)]">
        {steps.map((step) => (
          <li key={step.n} className={`flex items-start gap-4 px-6 py-4 ${step.done ? "opacity-40" : ""}`}>
            <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${step.done ? "bg-[var(--accent)] text-black" : "border border-[var(--border)] text-[var(--muted)]"}`}>
              {step.done ? "✓" : step.n}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[13px] font-medium ${step.done ? "line-through text-[var(--muted)]" : "text-[var(--text)]"}`}>{step.label}</p>
              <p className="mt-0.5 text-[12px] text-[var(--muted)]">{step.desc}</p>
            </div>
            {!step.done && (
              <Link href={step.href} className="shrink-0 text-[12px] text-[var(--accent)] hover:underline">{step.cta}</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
