import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPageUser } from "@/lib/dev-user";

export async function POST(request: Request) {
  const { id: uid } = await getPageUser();
  const supabase = await createClient();

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { company_id, stage, next_action, notes } = (body ?? {}) as {
    company_id?: string;
    stage?: string;
    next_action?: string | null;
    notes?: string | null;
  };

  if (!company_id) return NextResponse.json({ error: "company_id required" }, { status: 400 });

  const validStages = ["sourced", "meeting", "diligence", "passed", "invested"];
  const resolvedStage = validStages.includes(stage ?? "") ? stage! : "sourced";

  const { data, error } = await supabase
    .from("deals")
    .insert({
      user_id: uid,
      company_id,
      stage: resolvedStage,
      next_action: next_action ?? null,
      notes: notes ?? null,
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
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const b = body as { stage?: string; next_action?: string | null; notes?: string | null };

  const { data, error } = await supabase
    .from("deals")
    .update({
      ...(b.stage !== undefined && { stage: b.stage }),
      ...(b.next_action !== undefined && { next_action: b.next_action }),
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
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("deals")
    .delete()
    .eq("id", id)
    .eq("user_id", uid);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
