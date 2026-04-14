import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function autoTag(note: string, url: string | null): Promise<string[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return [];
  }

  const content = [note, url ? `URL: ${url}` : null].filter(Boolean).join("\n");

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      system:
        "You extract structured tags from VC deal flow notes. Return ONLY a JSON object with a single key 'tags' containing an array of strings. Tags should include: company names (if mentioned), founder names (if mentioned), themes (e.g. 'AI infrastructure', 'developer tools'), sectors (e.g. 'B2B SaaS', 'fintech'), and any other signal categories. Keep tags concise (1-3 words each). Return 3-8 tags maximum.",
      messages: [
        {
          role: "user",
          content: `Extract tags from this note:\n\n${content}`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON response
    const parsed = JSON.parse(text) as { tags?: unknown };
    const tags = parsed.tags;
    if (Array.isArray(tags)) {
      return (tags as unknown[])
        .filter((t): t is string => typeof t === "string")
        .slice(0, 10);
    }
    return [];
  } catch {
    // Non-fatal — clips still save without tags
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
