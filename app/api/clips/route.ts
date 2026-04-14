import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function autoTag(note: string, url: string | null): Promise<string[]> {
  if (!process.env.GEMINI_API_KEY) return [];

  const content = [note, url ? `URL: ${url}` : null].filter(Boolean).join("\n");

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Extract tags from this VC note. Return ONLY a JSON object {"tags":["..."]}. Include company names, founder names, themes (e.g. "AI infrastructure"), sectors (e.g. "B2B SaaS"). 3-8 tags max, 1-3 words each.\n\n${content}` }] }],
          generationConfig: { maxOutputTokens: 256 },
        }),
      }
    );

    const json = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return [];
    const parsed = JSON.parse(match[0]) as { tags?: unknown };
    if (Array.isArray(parsed.tags)) {
      return (parsed.tags as unknown[]).filter((t): t is string => typeof t === "string").slice(0, 10);
    }
    return [];
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("note" in body) ||
    typeof (body as Record<string, unknown>).note !== "string"
  ) {
    return NextResponse.json({ error: "note is required" }, { status: 400 });
  }

  const { note, url, source_type } = body as {
    note: string;
    url?: string | null;
    source_type?: string;
  };

  const validSourceTypes = ["tweet", "article", "conversation", "thought"] as const;
  type SourceType = (typeof validSourceTypes)[number];

  const resolvedSourceType: SourceType =
    validSourceTypes.includes(source_type as SourceType)
      ? (source_type as SourceType)
      : "thought";

  // Insert clip first (fast path)
  const { data: clip, error: insertError } = await supabase
    .from("clips")
    .insert({
      user_id: user.id,
      url: url ?? null,
      note,
      source_type: resolvedSourceType,
      tags: [],
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Auto-tag async — update clip with tags
  const tags = await autoTag(note, url ?? null);

  if (tags.length > 0 && clip) {
    await supabase.from("clips").update({ tags }).eq("id", clip.id);
    return NextResponse.json({ ...clip, tags });
  }

  return NextResponse.json(clip);
}
