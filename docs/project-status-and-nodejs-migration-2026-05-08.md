# Project Status Report & Node.js Migration Update

**Project**: Dutch Handbook / More Dutch  
**Branch**: `nodeJsImplementation`  
**Report date**: 2026-05-08  

---

## Executive summary

The project is actively transitioning from a primarily static/anonymous learning experience to a **Node.js (NestJS) + Prisma-backed platform** that can persist user progress across devices.

Recent work is concentrated on:

- **Progress tracking end-to-end** (Angular → API → DB): sheet mastery, verb/noun mastery, and quiz/KNM attempt history.
- **User preferences persistence**: dark mode, flashcard mode, and “hide mastered” filters.
- **Migration path** for existing anonymous users: a one-shot push of `localStorage` state into the server after first sign-in.

The migration direction is clear and consistent: **authenticated users use the API as the source of truth**, while anonymous users retain legacy `localStorage` behavior.

---

## Current status (high level)

### What’s implemented (backend)

- **NestJS progress module** exposing a versioned API under `v1`.
- **Prisma models** for progress entities and a new `UserPreference` table.
- **Zod validation** for request bodies using schemas shared via `@moredutch/shared`.
- **Unit tests** added for preferences logic in the progress service.

### What’s implemented (web)

- Progress service supports **anonymous + authenticated** modes.
- One-shot **anonymous progress migration** on sign-in (bulk push to API).
- Theme/preferences are now **persisted server-side** for authenticated users.
- Profile page surfaces **server-backed history + stats** (recent attempts and totals).
- Per-route SEO metadata and a sitemap/robots generator are in place.

---

## Node.js migration: what is “done” vs “in progress”

### Done

#### API endpoints added/extended (NestJS, `apps/api`)

Controller is versioned and mounted as:

- Base: `v1/progress/*` (NestJS versioning; effective public path depends on the app’s global prefix/versioning config)

Endpoints:

- **Sheet mastery**
  - `GET progress/mastery` → returns `{ [sheetSlug]: boolean }`
  - `POST progress/mastery` → set/unset mastery for a sheet
  - `POST progress/migrate` → bulk import from anonymous client state
- **Preferences**
  - `GET progress/preferences` → returns preferences with defaults
  - `PATCH progress/preferences` → partial update (204 response)
- **Verb/Noun mastery**
  - `GET progress/verbs`, `POST progress/verbs/sync`
  - `GET progress/nouns`, `POST progress/nouns/sync`
- **Attempts**
  - `POST progress/quiz-attempt`
  - `POST progress/knm-attempt`
  - `GET progress/attempts` → combined, most-recent list
  - `GET progress/stats` → counts summary

#### Database schema (Prisma)

- Added `UserPreference` with:
  - `darkMode`, `flashcardMode`, `hideMastered` (boolean flags)
  - `updatedAt` timestamp
  - FK to `User` with **cascade delete**

#### Migration support

- A new migration creates `UserPreference` in SQLite for local verification.
- The “anonymous → authenticated” migration endpoint accepts:
  - `masteredSlugs` (list of sheet slugs)
  - optional `preferences` blob

### In progress / needs follow-through

- **Repo hygiene**: local artifacts (Angular build cache + local SQLite journals) are present in the working tree and should not be committed.
- **Production DB parity**: Prisma is configured for SQLite locally; production plans indicate PostgreSQL. A clear deployment checklist is needed to ensure migrations and behavior stay consistent.
- **Integration hardening**: verify that progress migration runs exactly once per user (and doesn’t re-run, duplicate, or wipe unexpected state).

---

## Key recent functional changes (what the user sees)

### Progress now syncs across devices (when signed in)

- Logged-in users read/write mastery via the backend.
- Anonymous users keep legacy behavior (all local).

### Preferences now persist with the account

- Dark mode and flashcard blur mode patch server preferences when authenticated.
- Hide-mastered preference also syncs to the server.

### Profile page shows real learning history

- Recent attempts table for quiz/KNM.
- Stats summary (mastered sheets, verbs, nouns, total attempts).

---

## Architecture notes (current contract)

### Shared contract via `@moredutch/shared`

Progress and preference DTOs are validated using Zod schemas shared between:

- Angular web client (`apps/web`)
- NestJS API (`apps/api`)

This reduces drift and provides consistent runtime validation at the API boundary.

### Source-of-truth rules

- **Anonymous**: `localStorage`
- **Authenticated**: API + database
- **Bridge**: one-shot migration payload from anonymous state to server on first sign-in

---

## Risks & issues to address soon

### 1) Build/cache artifacts in git status

Observed changes include Angular cache output under `apps/web/.angular/cache/...` and local build metadata. These should be ignored and/or removed from tracking.

### 2) Local SQLite journal file not ignored

A `dev.db-journal` file is present and should never be committed.

Recommendation:

- Extend `.gitignore` to cover DB journal variants (including `*.db-journal`) and confirm Angular cache is fully ignored and untracked.

### 3) SQLite vs PostgreSQL differences

SQLite is used for local verification; production intends PostgreSQL. Differences to keep in mind:

- Date/time storage details
- Constraints/index behavior
- Transaction semantics/performance characteristics

Recommendation:

- Add a short “prod DB switch” checklist: env vars, provider switch, migration application, smoke tests.

---

## Suggested next steps (practical checklist)

- **Repository hygiene**
  - Ensure `apps/web/.angular/cache/` is ignored and not tracked
  - Ignore local Prisma SQLite artifacts (including `*.db-journal`)
- **Migration QA**
  - Test “anonymous progress → sign in → migration → profile reflects migrated progress”
  - Test preferences migration (dark/flashcard/hide-mastered) on first sign-in
- **Deployment readiness**
  - Document `DATABASE_URL`, versioned API base path assumptions, and production DB configuration
  - Add minimal smoke tests for API endpoints used by the client

---

## Appendix: working tree signals used for this report

This report is derived from the current working tree and recent branch history showing:

- Backend changes in `apps/api/` (Nest config, Prisma schema/migrations, progress module/service)
- Shared schema updates in `packages/shared/`
- Web client changes in `apps/web/` (progress/theme/meta/profile/routes and SEO generation)

