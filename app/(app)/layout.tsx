import { createClient } from "@/lib/supabase/server";
import NavLinks from "./NavLinks";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let email = "";

  // Try to get the real user if there's a session, but don't enforce auth
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    email = user?.email ?? "";
  } catch {
    // no session — that's fine
  }

  const initials = email ? email.slice(0, 2).toUpperCase() : "VS";

  return (
    <div className="flex h-full bg-[var(--bg)]">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--accent)] text-xs font-bold text-black tracking-tight">
            VS
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-[var(--text)]">Venture Signal</p>
            <p className="text-[10px] text-[var(--muted)] leading-tight">Deal flow intelligence</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4">
          <NavLinks />
        </nav>

        {/* User */}
        <div className="border-t border-[var(--border)] px-4 py-4">
          {email ? (
            <>
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--border)] text-[10px] font-semibold text-[var(--text)]">
                  {initials}
                </div>
                <span className="truncate text-xs text-[var(--muted)]" title={email}>
                  {email}
                </span>
              </div>
              <SignOutButton />
            </>
          ) : (
            <a
              href="/login"
              className="block text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
            >
              Sign in →
            </a>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function SignOutButton() {
  return (
    <form action="/auth/signout" method="POST">
      <button
        type="submit"
        className="mt-3 w-full rounded px-3 py-1.5 text-left text-xs text-[var(--muted)] transition-colors hover:text-[var(--text)]"
      >
        Sign out
      </button>
    </form>
  );
}
