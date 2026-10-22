# Phase 2 — Making Money from More Dutch

> A plan for turning More Dutch into a product that earns, once Phase 1
> (committing fixes + a stable, verified deploy) is done.
> Created 2026-10-14.

## The core idea
Keep the site free enough to attract learners, but put the genuinely valuable
material behind a paid plan. The strongest paid hook is **KNM / integration
exam prep** — people *have to* pass that exam and will pay for good preparation.

## Free vs. Paid split

**Free (the hook — brings people in, builds trust & SEO):**
- All 15 grammar cheat sheets
- Basic versions of the tools (verb explorer, flashcards, de/het, sentence builder)
- A limited taste of the KNM exam (e.g. one short practice set)

**Paid (the value — what people actually pay for):**
- Full KNM practice-exam question bank + realistic mock exams
- Unlimited quiz/flashcard practice
- Progress tracking & "weak spots" review
- Saved history and analytics across devices

## Pricing ideas (test and adjust)
- **Subscription:** ~€5–9 / month (or a discounted yearly plan)
- **One-time "KNM Exam Pack":** ~€15–25 — for people who just want to pass and leave
- Offer both: subscription for regular learners, one-time pack for exam crammers

## Payments
- Use **Stripe** — it handles both subscriptions and one-time purchases cleanly
- You already have user accounts, so a plan/flag can be attached to each user
- Needs: a Stripe account, a "checkout" flow, and a way for the app to check
  "is this user paid?" before unlocking premium content

## Build checklist (rough order)
1. Decide the exact free vs. paid feature list (from the split above)
2. Add a `plan` / `isPremium` flag to the user account
3. Set up Stripe (account + products/prices for subscription and the exam pack)
4. Build the checkout + "manage subscription" flow
5. Gate the premium content behind the paid check (frontend + backend)
6. Add an upgrade prompt where free users hit a limit (e.g. the KNM exam)
7. Test the full flow with Stripe's test mode before going live

## Secondary options (later / optional)
- **B2B:** sell access to integration schools, municipalities, or companies
  hiring expats — bigger cheques, slower sales
- **Affiliate links:** Dutch courses, textbooks
- **Ads:** avoid — low pay, hurts the experience

## Not yet / prerequisites
- Finish **Phase 1 first**: commit this session's fixes, add a lockfile,
  verify email (Resend domain) and the production deploy all work
- Don't build payments until the product is stable and trusted
