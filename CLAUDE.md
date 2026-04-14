# Venture Signal — Claude Bootstrap

This file is loaded automatically at the start of every Claude session.
Read it fully before doing anything else.

---

## What this project is

A personal research operating system for early-stage venture investing.
Every signal — a tweet, article, conversation, thought — gets captured, tagged, and routed into a living knowledge base. The core belief: compounding research beats episodic research.

**Pipeline:** Signal → Thesis → Deal

**Live app:** https://venture-omnidash-hdsn02spu-steenjennings-2672s-projects.vercel.app
**Repo:** https://github.com/SteenJennings/venture-omnidash
**Stack:** Next.js 15 (App Router, no src/ dir), Supabase, Tailwind, TypeScript, Gemini API, Vercel

---

## Key files to read first

| File | Purpose |
|------|---------|
| `TODO.md` | Prioritized task list — work top-to-bottom |
| `types/database.types.ts` | Full DB schema in TypeScript |

---

## How to start a session

1. **Read TODO.md** — pick up at the top unfinished item
2. **Check git status** — see what was in progress
3. Execute. If no specific task given, default to the top of TODO.md.

---

## Project structure

```
app/(app)/          # Authenticated app pages (feed, companies, theses)
app/(auth)/         # Login + OAuth callback
app/api/            # API routes (currently: /api/clips)
app/auth/signout/   # Sign-out handler
lib/supabase/       # client.ts (browser) + server.ts (server)
types/              # database.types.ts — hand-written DB types
middleware.ts       # Session refresh on every request
```

---

## Supabase

- **Project ref:** `tquqilhegfnccinjetyg`
- **URL:** `https://tquqilhegfnccinjetyg.supabase.co`
- **Anon key:** `sb_publishable_S66sln5mNgMjtxwcg-ZbOg_y0Ulfc6H`

### Schema (all tables are user-scoped via `user_id` + RLS)

| Table | Purpose |
|-------|---------|
| `clips` | Atomic signal units — url, note, tags, source_type, company_id, founder_id |
| `companies` | Deals being tracked — name, sector, stage, status, thesis, key_unknowns |
| `founders` | People worth tracking — name, twitter, linkedin, notes |
| `theses` | Investment beliefs — title, description, confidence |
| `thesis_clips` | Join: clips ↔ theses |
| `thesis_companies` | Join: companies ↔ theses |
| `deals` | Deal pipeline — company_id, stage, next_action, notes |

---

## Engineering conventions

### Running the project
```bash
npm run dev          # local dev
npm run build        # production build check
npx tsc --noEmit     # type check only
```

### Always before committing
```bash
npx tsc --noEmit && npm run build
```

### Patterns
- Server components fetch from Supabase directly (import from `@/lib/supabase/server`)
- Client components use browser client (import from `@/lib/supabase/client`)
- No shadcn, no raw hex in JSX — use CSS custom properties
- All DB migrations must be additive (never DROP or ALTER existing columns)

### Design tokens
```
--bg: #0D0D0D
--surface: #161616
--border: #242424
--text: #EFEFEF
--muted: #777777
--accent: #F59E0B
```
Use via Tailwind: `bg-[var(--surface)]`, `text-[var(--muted)]`, `border-[var(--border)]`

### Auth
- Magic link (email OTP) only — no Google OAuth yet
- Server: `const supabase = await createClient()` then `supabase.auth.getUser()`
- Client: `createClient()` from `@/lib/supabase/client`

---

## Core objects (spec reference)

**Clips** — atomic unit. url (optional), note, source_type (tweet/article/conversation/thought), auto-tags via Gemini, linked to company/founder/thesis.

**Companies** — deals you're watching. status: watching/tracking/passed/invested.

**Founders** — people worth tracking. Roll up all clips mentioning them.

**Theses** — investment beliefs built bottom-up from clips. confidence: forming/developing/conviction.

**Deals (V2)** — when a company gets serious. stage: sourced/meeting/diligence/passed/invested.

---

## AI integration

Auto-tagging uses **Gemini 2.0 Flash** (free tier) via direct REST call in `/api/clips/route.ts`.
Key: `GEMINI_API_KEY` in `.env.local` and Vercel env vars.
All other AI use (synthesis, weekly digest, memo workspace) is manual — export clips as text, paste into Claude or Gemini.

---

## V1 scope (build this)
Clips feed + add + auto-tag, Companies tracker, Theses board, auth, dark UI.
See TODO.md for exactly what's done and what's next.

## V2
Founders pages, URL scraper, weekly digest, deals pipeline.

## V3
Memo workspace, Chrome extension, mobile share sheet.
