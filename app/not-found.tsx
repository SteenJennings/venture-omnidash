import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-full items-center justify-center bg-[var(--bg)]">
      <div className="text-center">
        <p className="text-5xl font-semibold text-[var(--accent)]">404</p>
        <p className="mt-3 text-sm text-[var(--muted)]">Page not found</p>
        <Link
          href="/feed"
          className="mt-6 inline-block rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          Back to feed
        </Link>
      </div>
    </div>
  );
}
