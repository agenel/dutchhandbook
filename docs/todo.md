# More Dutch — To-Do

> Living to-do list. Last updated 2026-10-22.

## Content — add more questions & examples (priority)
This is the biggest ongoing need — more material makes the product more valuable
(and is the perfect job for Claude to help generate, then you review).

**MERGED 2026-10-22 (local only, not deployed or committed):**
All 780 drafted items from `content-drafts/` are now in `apps/web/public/assets/data/`,
mirrored to `apps/api/prisma/seed-data/` (which now uses the same format as the web data).
- [x] KNM: 200 → 450 questions (45 per chapter)
- [x] Grammar quiz: 125 → 285 questions; category labels reconciled (30 → 24 topics,
      e.g. "de/het Articles" → "Articles (De & Het)", "Perfectum" → "Perfect Tense (Perfectum)")
- [x] Sentence builder: 7 → 107 sentences, ordered by rule (V2 → … → subordinate clauses)
- [x] Flashcards: 10 → 18 decks (110 → 230 cards)
- [x] Common words: 20 → 30 lessons (444 → 594 words)
- [x] Fixed `knm/ch2.json` `ch2-15` (typo "what" → "wat", `correctIndex` -1 → 1)
- [x] KNM `ch6-n-5` now uses "doorstroomtoets" (the group-8 test's name since 2024)
- [x] Sentence `s-1-1`: mid-sentence "Wij" → "wij"
- [x] Homepage tool-card copy now matches the real counts (`packages/shared/src/types/tool.ts`)

**Still to do:**
- [ ] Human review of the remaining KNM civics flags against the exam textbook edition:
      leerplicht/kwalificatieplicht ages, minimum-wage age 21, vakantiegeld "meestal in mei",
      Belgium 1830 (vs 1839 recognition), slavery 1863 (vs 1873 transition),
      euthanasia/abortion wording. (A 25-item random spot-check found no errors.)
- [ ] Stale "1000 words" / "500+ nouns" / "linked to cheat sheets" copy still in
      `app.routes.ts` SEO metadata, the Common Words page heading, and the nav menu.
- [ ] Add more **example conjugations** in the verb explorer / wheel (not yet drafted)
- [ ] `content-drafts/` can be deleted once the merge is deployed.

## Phase 1 — Ship what we have (do first)
- [ ] Commit this session's work (security fixes + UI fixes)
- [ ] Commit a lockfile so deploys are reproducible
- [ ] Verify email actually sends (Resend domain verified in DNS)
- [ ] Confirm production deploy works end-to-end (Vercel + Render + Neon)

## Phase 2 — Monetization
See `docs/phase-2-monetization.md` for the full plan.
- [ ] Decide free vs. paid feature split
- [ ] Add Stripe + a paid/premium flag on accounts
- [ ] Gate premium content (KNM exam bank, unlimited practice, analytics)

## Cleanup / housekeeping
- [ ] Update `.env.example` to document the email (SMTP) settings
- [ ] Remove leftover debug/junk files (e.g. `check-user.js`, test payload)
- [ ] Decide what to do with the stashed "streak and xp" (gamification) work
- [ ] Refresh README / SECURITY docs to match the current state
