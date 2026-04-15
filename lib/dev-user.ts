/**
 * In development, pages can't auth — return a sentinel UUID so Supabase queries
 * produce empty results instead of crashing.
 */
export const DEV_USER_ID = "00000000-0000-0000-0000-000000000000";

export async function getPageUser(): Promise<{ id: string; email: string }> {
  if (process.env.NODE_ENV === "development") {
    return { id: DEV_USER_ID, email: "dev@local" };
  }
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // No session — return sentinel so all queries produce empty results (guest mode)
  if (!user) return { id: DEV_USER_ID, email: "" };
  return { id: user.id, email: user.email ?? "" };
}
