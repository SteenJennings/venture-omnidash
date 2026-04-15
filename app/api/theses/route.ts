import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPageUser } from "@/lib/dev-user";

export async function GET() {
  const { id: uid } = await getPageUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("theses")
    .select("id, title")
    .eq("user_id", uid)
    .order("title");
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

  const b = body as { title?: string; description?: string | null; confidence?: number };
  if (!b.title?.trim()) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("theses")
    .insert({
      user_id: uid,
      title: b.title.trim(),
      description: b.description ?? null,
      confidence: b.confidence ?? 50,
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
    title?: string;
    description?: string | null;
    confidence?: number | null;
  };

  const { data, error } = await supabase
    .from("theses")
    .update({
      ...(b.title !== undefined && { title: b.title }),
      ...(b.description !== undefined && { description: b.description }),
      ...(b.confidence !== undefined && { confidence: b.confidence }),
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
    .from("theses")
    .delete()
    .eq("id", id)
    .eq("user_id", uid);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
