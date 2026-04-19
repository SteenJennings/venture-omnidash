export default function JournalLoading() {
  return (
    <div className="px-10 py-8 animate-pulse">
      <div className="mb-6 flex gap-2">
        {[80, 96, 72, 88, 96, 64].map((w, i) => (
          <div key={i} className="h-6 rounded-full bg-[var(--surface)]" style={{ width: w }} />
        ))}
      </div>
      <div className="space-y-8">
        {[1, 2].map(g => (
          <div key={g}>
            <div className="mb-3 h-3 w-32 rounded bg-[var(--surface)]" />
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 rounded-xl bg-[var(--surface)]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
