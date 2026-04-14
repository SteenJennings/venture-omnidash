import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST: link a clip to a thesis
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

  const { thesis_id, clip_id } = (body ?? {}) as {
    thesis_id?: string;
    clip_id?: string;
  };

  if (!thesis_id || !clip_id) {
    return NextResponse.json({ error: "thesis_id and clip_id required" }, { status: 400 });
  }

  // Verify the thesis belongs to the user
  const { data: thesis } = await supabase
    .from("theses")
    .select("id")
    .eq("id", thesis_id)
    .eq("user_id", user.id)
    .single();

  if (!thesis) return NextResponse.json({ error: "Thesis not found" }, { status: 404 });

  // Verify the clip belongs to the user
  const { data: clip } = await supabase
    .from("clips")
    .select("id")
    .eq("id", clip_id)
    .eq("user_id", user.id)
    .single();

  if (!clip) return NextResponse.json({ error: "Clip not found" }, { status: 404 });

  const { error } = await supabase
    .from("thesis_clips")
    .upsert({ thesis_id, clip_id }, { onConflict: "thesis_id,clip_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
