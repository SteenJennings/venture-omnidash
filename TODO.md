# Venture Signal — TODO

Work top-to-bottom. Each item is self-contained enough to execute without re-reading the codebase.

---

## P0 — Broken / blocking

- [ ] **Fix auth magic link flow** — login page doesn't work end-to-end yet; debug the magic link redirect and session establishment on production
- [ ] **Show auth error on login page** — callback redirects to `/login?error=auth` on failure but the page never reads or displays it; add a simple error message when `?error=auth` is present
- [ ] **Fix thesis clip count type** — `thesis_clips(count)` via PostgREST may return count as a string; wrap with `Number(...)` to ensure correct display

---

## P1 — Core missing features (V1 complete)

- [ ] **Active nav highlight** — add `usePathname()` to the sidebar nav, apply active styles to the current route link
- [ ] **Clip detail / edit / delete** — clips are append-only; add expand-on-click for full note, edit note/tags inline, delete with confirmation
- [ ] **Company detail page** — `/companies/[id]` — show all clips linked to this company, editable thesis text, key unknowns field, linked founders
- [ ] **Thesis detail page** — `/theses/[id]` — show all linked clips, linked companies, edit title/description/confidence
- [ ] **Link clips to companies** — add company selector to `AddClipButton` modal; show company name on clip card
- [ ] **Link clips to theses** — add "Add to thesis" action on clip card; show thesis badge on clip
- [ ] **Link companies to theses** — add company selector on thesis detail page using `thesis_companies` join table
- [ ] **Tag filtering on feed** — click any tag pill to filter the clip feed; show active filter with clear button
- [ ] **Search on feed** — text input that filters clips by note content client-side (or via Supabase `.ilike`)
- [ ] **Edit / delete companies** — inline edit for status, sector, thesis; delete with confirmation
- [ ] **Edit / delete theses** — inline edit for title, description, confidence; delete

---

## P2 — Missing entities

- [ ] **Founders page** — `/founders` — list all founders, add founder (name, twitter, linkedin, notes), link to companies
- [ ] **Founder detail page** — `/founders/[id]` — all clips mentioning them, company affiliations, notes
- [ ] **Add founder selector to clip form** — optional founder tag when adding a clip
- [ ] **Nav link for Founders** — add to sidebar after Theses

---

## P3 — Polish

- [ ] **Loading states** — add `loading.tsx` alongside feed, companies, theses pages (skeleton cards)
- [ ] **Empty states** — ensure every list has a clear empty state with a call to action (currently partial)
- [ ] **`key_unknowns` field** — surface on company detail page and in the add/edit company form
- [ ] **Custom 404 page** — add `app/not-found.tsx`
- [ ] **Error boundaries** — add `error.tsx` to app pages

---

## P4 — Export / AI layer (manual workflow)

- [ ] **Export clips button** — "Copy to clipboard" on feed (or filtered subset) — formats clips as clean text for pasting into Claude/Gemini for synthesis
- [ ] **Export by company** — on company detail page, copy all clips + thesis + key unknowns as a structured brief
- [ ] **Export by thesis** — on thesis detail page, copy all linked clips formatted for synthesis

---

## V2 (future)

- [ ] Deals pipeline — `/deals` kanban (sourced / meeting / diligence / passed / invested)
- [ ] Memo workspace — company page pre-loads all clips + thesis notes as a draft memo
- [ ] Weekly digest — cron job using Gemini to synthesize the week's clips into a summary
- [ ] URL scraper — paste a URL, Gemini extracts the key insight as a pre-filled clip
- [ ] Chrome extension — one-click clip from any page or tweet
- [ ] Bear case generator — given a company, surface strongest arguments against investing

---

## Security (before sharing with anyone else)

- [ ] Confirm RLS policies are enforced on all tables — run `SELECT * FROM pg_policies;` in Supabase SQL editor
- [ ] Rotate Supabase anon key if it was ever exposed publicly
- [ ] Rate limit `/api/clips`
