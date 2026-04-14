# Venture Signal — TODO

Work top-to-bottom. Each item is self-contained enough to execute without re-reading the codebase.

---

## ✅ Completed (session 2 — April 13, 2026)

- [x] Fix auth magic link flow — created `app/auth/callback/route.ts` matching login redirect URL
- [x] Show auth error on login page — reads `?error=auth` URL param (wrapped in Suspense)
- [x] Fix thesis clip count type — `Number(thesis_clips?.[0]?.count ?? 0)`
- [x] Active nav highlight — `NavLinks` client component with `usePathname()`
- [x] Clip detail / expand / delete — FeedClient with expand-on-click, delete confirm, tag filtering, search
- [x] Company detail page — `/companies/[id]` with clips, thesis, key unknowns, edit, delete
- [x] Thesis detail page — `/theses/[id]` with clips, companies, edit, delete
- [x] Link clips to companies — company selector in AddClipButton modal
- [x] Link clips to theses — "+ thesis" action on clip card → `/api/thesis-clips`
- [x] Link companies to theses — ThesisCompanyLinker on thesis detail
- [x] Tag filtering on feed — click tag pills to filter, clear button
- [x] Search on feed — client-side note content filter
- [x] Edit / delete companies — CompanyActions inline edit + delete with confirmation
- [x] Edit / delete theses — ThesisActions inline edit + delete with confirmation
- [x] Founders page — list, add (name/twitter/linkedin/notes)
- [x] Founder detail page — `/founders/[id]` with clips, social links
- [x] Nav link for Founders
- [x] Loading states — skeleton `loading.tsx` on all main pages
- [x] Custom 404 page — `app/not-found.tsx`
- [x] `/api/companies` PATCH + DELETE
- [x] `/api/theses` PATCH + DELETE
- [x] `/api/thesis-clips` POST
- [x] `/api/thesis-companies` POST

---

## P0 — Needs manual intervention (user action required)

- [ ] **Supabase RLS audit** — run `SELECT * FROM pg_policies;` in Supabase SQL editor
  - Confirm all 7 tables have RLS enabled and user-scoped policies
  - `thesis_clips` and `thesis_companies` need RLS: user must own both sides
- [ ] **Rotate Supabase anon key** — if it was ever exposed (e.g. committed to git)
  - Supabase dashboard → Settings → API → Regenerate anon key → update Vercel env vars
- [ ] **Rate limit `/api/clips`** — add Vercel rate limiting or simple in-memory guard
- [ ] **Publish Google OAuth consent screen** — currently "Testing", external users blocked
  - Google Cloud Console → APIs & Services → OAuth consent screen → Publish App

---

## P1 — Founder enrichment (add founder selector to clips)

- [ ] **Founder selector in AddClipButton** — optional founder dropdown when adding a clip
  - Fetch founders client-side on modal open (like company selector)
  - Pass `founder_id` in POST body to `/api/clips`
- [ ] **Edit / delete founders** — add FounderActions client component on founder detail page
  - PATCH `/api/founders?id=` with name/twitter/linkedin/notes
  - DELETE with confirm, redirect to /founders
- [ ] **`/api/founders` route** — PATCH + DELETE handlers (parallel to companies/theses)

---

## P2 — Dashboard (home page)

- [ ] **Build a real dashboard at `/`** — replace the current redirect with a summary view
  - "At a glance" metrics: clip count, company count, thesis count, founder count
  - Recent activity feed: last 5 clips + last 3 companies updated
  - Quick-add clip button inline
  - Thesis confidence distribution (simple bar or text breakdown)
  - "What to do next" prompt based on stalest company (longest since update)

---

## P3 — Company intelligence

- [ ] **Clip count badge on company list** — show `(N clips)` next to each company row
  - Add `clips(count)` to the companies query with a `.eq("company_id", company.id)` join
- [ ] **Company search / filter** — search bar + status filter tabs on `/companies`
- [ ] **Add founder to company** — on company detail, link a founder (new `company_founders` join table + migration)
- [ ] **"Last activity" on company list** — show days-since-last-clip for each company
  - Helps surface companies going cold (no activity in 30 days)

---

## P4 — Thesis intelligence

- [ ] **Thesis clip count on list** — currently uses PostgREST aggregate, ensure correct
- [ ] **Thesis confidence over time** — track changes when confidence is updated (new `thesis_history` table)
  - Append a row on each PATCH to `/api/theses`
  - Show sparkline or "last changed" on thesis detail
- [ ] **Related theses** — on thesis detail, suggest other theses that share clips or companies

---

## P5 — Export / AI synthesis (manual workflow)

- [ ] **Export clips button** — "Copy to clipboard" on feed
  - Format: one clip per line with date, source, note, tags
  - Paste into Claude for synthesis
- [ ] **Export company brief** — on company detail, copy all clips + thesis + key unknowns as a structured brief
  - Format: company name, status, thesis, key unknowns, then clips chronologically
- [ ] **Export thesis brief** — on thesis detail, copy description + all linked clips + companies
- [ ] **One-click Claude analysis prompt** — pre-fill a textarea with a synthesis prompt and the exported data
  - User copies prompt → pastes into Claude → gets instant analysis

---

## P6 — URL scraper (V2 foundation)

- [ ] **URL enrichment on clip save** — when a URL is provided, call a scraper endpoint to extract title + key quote
  - Use `fetch` + basic HTML parsing or a free scraper API
  - Pre-fill the note field with the extracted quote for the user to edit
- [ ] **Auto-detect company name from URL** — if URL domain matches a known company, auto-select it in the selector

---

## P7 — Deals pipeline

- [ ] **`/deals` page** — kanban board (sourced / meeting / diligence / passed / invested)
  - Each card: company name, stage, next action, days in stage
  - Drag-and-drop stage update (or simple status dropdown)
- [ ] **Deal detail** — `/deals/[id]` with linked company, notes, next action edit, stage history
- [ ] **Next action reminder** — surface deals with overdue next actions on the dashboard

---

## P8 — Learning & VC education layer (unique for new investors)

- [ ] **"Why this matters" tooltips** — small info icons next to "Thesis", "Key Unknowns", "Stage"
  - Hover/click reveals a short VC-education note (e.g., "Key unknowns are the questions that would change your conviction if answered")
- [ ] **Guided onboarding flow** — first-time user sees a step-by-step prompt:
  1. Add your first investment thesis
  2. Find a company that fits it
  3. Add your first clip (observation)
  4. Link the clip to the thesis
- [ ] **Thesis quality score** — for each thesis, score it on: number of clips (evidence), number of companies (applicability), confidence level, recency of last update
  - Surface a "thesis health" indicator on the theses list
- [ ] **"Conviction builder"** — on thesis detail, show a progress checklist:
  - [ ] Define the market
  - [ ] Find 3+ companies
  - [ ] Add 5+ supporting clips
  - [ ] Identify the key risks
  - [ ] Write a bear case

---

## P9 — Weekly digest

- [ ] **Weekly summary cron** — Vercel cron at 8am Monday
  - Aggregate: clips added this week, companies updated, theses with new evidence
  - Call Gemini to synthesize into 3 bullet takeaways
  - Store in a `digests` table, surface on dashboard
- [ ] **Digest page** — `/digest` shows last 4 weeks of summaries

---

## P10 — Chrome extension (V3)

- [ ] One-click clip from any page: pre-fills URL, auto-detects source type (tweet vs article)
- [ ] Popup shows recent clips + quick-add form
- [ ] Auth via Supabase session cookie

---

## Security (before sharing)

- [ ] Confirm RLS on `thesis_clips` + `thesis_companies` — user must own thesis AND clip/company
- [ ] Add `created_at` index on `clips` for performance as data grows
- [ ] Move Supabase anon key out of CLAUDE.md and into environment only

