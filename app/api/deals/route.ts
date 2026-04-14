import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { company_id, stage, next_action, notes } = (body ?? {}) as {
    company_id?: string;
    stage?: string;
    next_action?: string | null;
    notes?: string | null;
  };

  if (!company_id) return NextResponse.json({ error: "company_id required" }, { status: 400 });

  // Verify company ownership
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("id", company_id)
    .eq("user_id", user.id)
    .single();
  if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const validStages = ["sourced", "meeting", "diligence", "passed", "invested"];
  const resolvedStage = validStages.includes(stage ?? "") ? stage! : "sourced";

  const { data, error } = await supabase
    .from("deals")
    .insert({
      user_id: user.id,
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const b = body as {
    stage?: string;
    next_action?: string | null;
    notes?: string | null;
  };

  const { data, error } = await supabase
    .from("deals")
    .update({
      ...(b.stage !== undefined && { stage: b.stage }),
      ...(b.next_action !== undefined && { next_action: b.next_action }),
      ...(b.notes !== undefined && { notes: b.notes }),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("deals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
