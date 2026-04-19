import { createClient } from "@/lib/supabase/server";
import { getPageUser } from "@/lib/dev-user";
import JournalClient from "./JournalClient";

export default async function JournalPage() {
  const { id: uid } = await getPageUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", uid)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <JournalClient entries={(data ?? []) as any} />;
}
