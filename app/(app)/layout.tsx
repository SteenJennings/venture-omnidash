import { createClient } from "@/lib/supabase/server";
import NavLinks from "./NavLinks";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let email = "";

  if (process.env.NODE_ENV === "development") {
    email = "dev@local";
  } else {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      email = user?.email ?? "";
    } catch {
      // no session
    }
  }

  const initials = email ? email.slice(0, 2).toUpperCase() : "VS";

  return (
    <div className="flex h-full bg-[var(--bg)]">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--surface)]">
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-[11px] font-bold text-black shadow-md shadow-amber-500/20">
            VS
          </div>
          <div>
            <p className="text-[13px] font-semibold leading-tight tracking-tight text-[var(--text)]">Venture Signal</p>
            <p className="text-[10px] leading-tight text-[var(--muted)]">Deal flow intelligence</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-2">
          <NavLinks />
        </nav>

        {/* User */}
        <div className="border-t border-[var(--border-subtle)] px-3 py-3">
          {email ? (
            <div className="rounded-lg p-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-dim)] text-[10px] font-semibold text-[var(--accent)]">
                  {initials}
                </div>
                <span className="truncate text-[11px] text-[var(--muted)]" title={email}>
                  {email}
                </span>
              </div>
              <SignOutButton />
            </div>
          ) : (
            <a
              href="/login"
              className="block rounded-lg px-2 py-2 text-xs text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
            >
              Sign in →
            </a>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex min-h-full flex-1 flex-col overflow-auto">{children}</main>
    </div>
  );
}

function SignOutButton() {
  return (
    <form action="/auth/signout" method="POST">
      <button
        type="submit"
        className="mt-2 w-full rounded-md px-2 py-1 text-left text-[11px] text-[var(--muted)] transition-colors hover:text-red-400"
      >
        Sign out
      </button>
    </form>
  );
}
