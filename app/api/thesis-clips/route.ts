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

  const { thesis_id, clip_id } = (body ?? {}) as { thesis_id?: string; clip_id?: string };
  if (!thesis_id || !clip_id) {
    return NextResponse.json({ error: "thesis_id and clip_id required" }, { status: 400 });
  }

  // Verify ownership of both sides
  const [{ data: thesis }, { data: clip }] = await Promise.all([
    supabase.from("theses").select("id").eq("id", thesis_id).eq("user_id", uid).single(),
    supabase.from("clips").select("id").eq("id", clip_id).eq("user_id", uid).single(),
  ]);

  if (!thesis) return NextResponse.json({ error: "Thesis not found" }, { status: 404 });
  if (!clip) return NextResponse.json({ error: "Clip not found" }, { status: 404 });

  const { error } = await supabase
    .from("thesis_clips")
    .upsert({ thesis_id, clip_id }, { onConflict: "thesis_id,clip_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
