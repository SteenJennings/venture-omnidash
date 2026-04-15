export default function DealsLoading() {
  return (
    <div className="px-8 py-8 animate-pulse">
      <div className="mb-8">
        <div className="h-5 w-16 rounded bg-[var(--border)]" />
        <div className="mt-1 h-3 w-24 rounded bg-[var(--border)]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-3 h-4 w-20 rounded bg-[var(--border)]" />
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="rounded-md border border-[var(--border)] bg-[var(--bg)] p-3">
                  <div className="h-3 w-28 rounded bg-[var(--border)]" />
                  <div className="mt-2 h-3 w-20 rounded bg-[var(--border)]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
