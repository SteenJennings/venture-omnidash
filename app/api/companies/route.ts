import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPageUser } from "@/lib/dev-user";

export async function GET() {
  const { id: uid } = await getPageUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("id, name, status, stage")
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
    sector?: string | null;
    stage?: string | null;
    status?: string;
    thesis?: string | null;
    website?: string | null;
    linkedin?: string | null;
  };

  if (!b.name?.trim()) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("companies")
    .insert({
      user_id: uid,
      name: b.name.trim(),
      sector: b.sector ?? null,
      stage: b.stage ?? null,
      status: b.status ?? "tracking",
      thesis: b.thesis ?? null,
      website: b.website ?? null,
      linkedin: b.linkedin ?? null,
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
    sector?: string | null;
    stage?: string | null;
    status?: string | null;
    thesis?: string | null;
    key_unknowns?: string | null;
    website?: string | null;
    linkedin?: string | null;
  };

  const { data, error } = await supabase
    .from("companies")
    .update({
      ...(b.name !== undefined && { name: b.name }),
      ...(b.sector !== undefined && { sector: b.sector }),
      ...(b.stage !== undefined && { stage: b.stage }),
      ...(b.status !== undefined && { status: b.status }),
      ...(b.thesis !== undefined && { thesis: b.thesis }),
      ...(b.key_unknowns !== undefined && { key_unknowns: b.key_unknowns }),
      ...(b.website !== undefined && { website: b.website }),
      ...(b.linkedin !== undefined && { linkedin: b.linkedin }),
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
    .from("companies")
    .delete()
    .eq("id", id)
    .eq("user_id", uid);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
