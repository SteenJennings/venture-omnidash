export default function ThesesLoading() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-8 animate-pulse">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="h-5 w-16 rounded bg-[var(--border)]" />
          <div className="mt-1 h-3 w-16 rounded bg-[var(--border)]" />
        </div>
        <div className="h-8 w-24 rounded-md bg-[var(--border)]" />
      </div>
      <ul className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-2 flex items-start justify-between">
              <div className="h-4 w-48 rounded bg-[var(--border)]" />
              <div className="h-5 w-16 rounded bg-[var(--border)]" />
            </div>
            <div className="h-3 w-full rounded bg-[var(--border)]" />
            <div className="mt-1 h-3 w-3/4 rounded bg-[var(--border)]" />
          </li>
        ))}
      </ul>
    </div>
  );
}
