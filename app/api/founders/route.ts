import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPageUser } from "@/lib/dev-user";

export async function GET() {
  const { id: uid } = await getPageUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("founders")
    .select("id, name")
    .eq("user_id", uid)
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const { id: uid } = await getPageUser();
  const supabase = await createClient();

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as {
    name?: string;
    twitter?: string | null;
    linkedin?: string | null;
    notes?: string | null;
  };

  if (!b.name?.trim()) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("founders")
    .insert({
      user_id: uid,
      name: b.name.trim(),
      twitter: b.twitter ?? null,
      linkedin: b.linkedin ?? null,
      notes: b.notes ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const { id: uid } = await getPageUser();
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const b = body as {
    name?: string;
    twitter?: string | null;
    linkedin?: string | null;
    notes?: string | null;
  };

  const { data, error } = await supabase
    .from("founders")
    .update({
      ...(b.name !== undefined && { name: b.name }),
      ...(b.twitter !== undefined && { twitter: b.twitter }),
      ...(b.linkedin !== undefined && { linkedin: b.linkedin }),
      ...(b.notes !== undefined && { notes: b.notes }),
    })
    .eq("id", id)
    .eq("user_id", uid)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { id: uid } = await getPageUser();
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await supabase
    .from("founders")
    .delete()
    .eq("id", id)
    .eq("user_id", uid);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
