import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NavLinks from "./NavLinks";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.email ?? "";
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <div className="flex h-full bg-[var(--bg)]">
      {/* Sidebar */}
      <aside className="flex w-52 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
        {/* Logo */}
        <div className="border-b border-[var(--border)] px-5 py-5">
          <span className="text-sm font-semibold tracking-tight text-[var(--text)]">
            Venture Signal
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4">
          <NavLinks />
        </nav>

        {/* User */}
        <div className="border-t border-[var(--border)] px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-black">
              {initials}
            </div>
            <span
              className="truncate text-xs text-[var(--muted)]"
              title={email}
            >
              {email}
            </span>
          </div>
          <SignOutButton />
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
