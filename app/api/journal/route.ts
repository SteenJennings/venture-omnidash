import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPageUser } from "@/lib/dev-user";

export async function GET() {
  const { id: uid } = await getPageUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", uid)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const { id: uid } = await getPageUser();
  const supabase = await createClient();
  const body = await req.json();

  const { entry_date, entry_type, title, notes, contact_name, contact_company, outcome } = body;
  if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      user_id: uid,
      entry_date: entry_date ?? new Date().toISOString().split("T")[0],
      entry_type: entry_type ?? "note",
      title: title.trim(),
      notes: notes?.trim() || null,
      contact_name: contact_name?.trim() || null,
      contact_company: contact_company?.trim() || null,
      outcome: outcome?.trim() || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id: uid } = await getPageUser();
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", uid);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
