"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(
    urlError === "auth" ? "Authentication failed. Please try again." : null
  );

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden bg-[var(--bg)]">

      {/* Background grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      {/* Top amber glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 50% 35% at 50% 0%, rgba(245,158,11,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-[400px] px-4">

        {/* Brand */}
        <div className="mb-10 text-center">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-[13px] font-bold text-black shadow-xl shadow-amber-500/25">
            VS
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-[var(--text)]">
            Venture Signal
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
            Your personal research OS for early-stage investing.<br />
            Signals → Theses → Conviction.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-2xl shadow-black/60">
          {sent ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-lg">
                ✉
              </div>
              <p className="text-[14px] font-semibold text-[var(--text)]">Check your inbox</p>
              <p className="mt-2 text-[13px] text-[var(--muted)]">
                Magic link sent to{" "}
                <span className="font-medium text-[var(--text)]">{email}</span>
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-5 text-[12px] text-[var(--muted)] underline-offset-2 hover:text-[var(--text)] hover:underline"
              >
                Use a different address
              </button>
            </div>
          ) : (
            <>
              {/* Google */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-3 text-[13px] font-medium text-[var(--text)] transition-all hover:border-white/10 hover:bg-white/[0.05] active:scale-[0.98] disabled:opacity-40"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-[var(--border)]" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted-2)]">or</span>
                <div className="h-px flex-1 bg-[var(--border)]" />
              </div>

              {/* Magic link */}
              <form onSubmit={handleMagicLink} className="space-y-3">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[13px] text-[var(--text)] placeholder:text-[var(--muted-2)] transition-colors focus:border-[var(--accent)]/60 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-[13px] font-semibold text-black shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
                >
                  {loading ? "Sending…" : "Send magic link"}
                </button>
              </form>
            </>
          )}

          {error && (
            <p className="mt-4 rounded-lg border border-red-900/30 bg-red-950/20 px-3 py-2 text-center text-[12px] text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] leading-relaxed text-[var(--muted-2)]">
          Your data stays yours.&nbsp; No tracking, no ads.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center bg-[var(--bg)]">
          <div className="h-12 w-12 rounded-2xl bg-[var(--accent)] opacity-30" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
