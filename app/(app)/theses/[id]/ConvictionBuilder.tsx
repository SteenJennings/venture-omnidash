"use client";

const STEPS = [
  {
    id: "market",
    label: "Define the market",
    detail: "How big is it? Is it growing? Why now?",
  },
  {
    id: "companies",
    label: "Find 3+ companies",
    detail: "Who is building in this space? Link them to this thesis.",
  },
  {
    id: "clips",
    label: "Add 5+ supporting clips",
    detail: "Tweets, articles, conversations that validate the trend.",
  },
  {
    id: "risks",
    label: "Identify key risks",
    detail: "What could kill this thesis? Add them to Key Unknowns.",
  },
  {
    id: "bear",
    label: "Write a bear case",
    detail: "Steelman the argument against. Add to thesis description.",
  },
];

export default function ConvictionBuilder({
  clipCount,
  companyCount,
  hasDescription,
}: {
  clipCount: number;
  companyCount: number;
  hasDescription: boolean;
}) {
  const completed = {
    market: hasDescription,
    companies: companyCount >= 3,
    clips: clipCount >= 5,
    risks: false, // manual
    bear: hasDescription && companyCount >= 1,
  };

  const doneCount = Object.values(completed).filter(Boolean).length;
  const pct = Math.round((doneCount / STEPS.length) * 100);

  return (
    <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
          Conviction Builder
        </h2>
        <span className="text-xs font-medium text-[var(--accent)]">
          {doneCount}/{STEPS.length} · {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-1.5 w-full rounded-full bg-[var(--border)]">
        <div
          className="h-1.5 rounded-full bg-[var(--accent)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="space-y-2">
        {STEPS.map((step) => {
          const done = completed[step.id as keyof typeof completed];
          return (
            <li key={step.id} className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border text-xs ${
                  done
                    ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                    : "border-[var(--border)] text-transparent"
                }`}
              >
                ✓
              </div>
              <div>
                <p
                  className={`text-xs font-medium ${
                    done ? "text-[var(--text)] line-through opacity-60" : "text-[var(--text)]"
                  }`}
                >
                  {step.label}
                </p>
                {!done && (
                  <p className="text-xs text-[var(--muted)]">{step.detail}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {doneCount === STEPS.length && (
        <p className="mt-4 rounded-md bg-emerald-900/20 px-3 py-2 text-xs text-emerald-400">
          Thesis is fully developed. Ready for the export-to-Claude synthesis.
        </p>
      )}
    </section>
  );
}
