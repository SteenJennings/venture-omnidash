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

  const { thesis_id, company_id } = (body ?? {}) as {
    thesis_id?: string;
    company_id?: string;
  };

  if (!thesis_id || !company_id) {
    return NextResponse.json({ error: "thesis_id and company_id required" }, { status: 400 });
  }

  // Verify ownership
  const { data: thesis } = await supabase
    .from("theses")
    .select("id")
    .eq("id", thesis_id)
    .eq("user_id", user.id)
    .single();
  if (!thesis) return NextResponse.json({ error: "Thesis not found" }, { status: 404 });

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("id", company_id)
    .eq("user_id", user.id)
    .single();
  if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const { error } = await supabase
    .from("thesis_companies")
    .upsert({ thesis_id, company_id }, { onConflict: "thesis_id,company_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
