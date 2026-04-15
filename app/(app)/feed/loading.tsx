export default function FeedLoading() {
  return (
    <div className="px-8 py-8 animate-pulse">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="h-5 w-12 rounded bg-[var(--border)]" />
          <div className="mt-1 h-3 w-20 rounded bg-[var(--border)]" />
        </div>
        <div className="h-8 w-24 rounded-md bg-[var(--border)]" />
      </div>
      <div className="mb-6 h-9 w-full rounded-md bg-[var(--border)]" />
      <ul className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-3 h-4 w-3/4 rounded bg-[var(--border)]" />
            <div className="mb-2 h-3 w-full rounded bg-[var(--border)]" />
            <div className="h-3 w-1/2 rounded bg-[var(--border)]" />
          </li>
        ))}
      </ul>
    </div>
  );
}
