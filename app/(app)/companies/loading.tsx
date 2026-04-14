export default function CompaniesLoading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8 animate-pulse">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="h-5 w-24 rounded bg-[var(--border)]" />
          <div className="mt-1 h-3 w-20 rounded bg-[var(--border)]" />
        </div>
        <div className="h-8 w-28 rounded-md bg-[var(--border)]" />
      </div>
      <ul className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <div className="flex-1">
              <div className="h-4 w-40 rounded bg-[var(--border)]" />
              <div className="mt-1.5 h-3 w-60 rounded bg-[var(--border)]" />
            </div>
            <div className="h-3 w-12 rounded bg-[var(--border)]" />
          </li>
        ))}
      </ul>
    </div>
  );
}
