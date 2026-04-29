# Cutover checklist

This repo currently contains:

- `legacy/`: old static site (reference)
- `apps/web`: new Angular app (dev server and SSR entry exist)
- `apps/api`: new NestJS API (auth + progress)

## Preview deploy

1. Provision Postgres + Redis.
2. Set env vars from `.env.example` on the host.
3. Deploy API and SSR server behind TLS (nginx/managed platform).
4. QA every old URL:
   - `/index.html` → `/`
   - `/cheatsheets.html` → `/cheatsheets`
   - `/help.html` → `/help`
   - `/sheets/<slug>.html` → `/sheets/<slug>`
   - `/tools/<slug>.html` → `/tools/<slug>`

## DNS cutover

1. Switch DNS to the new host.
2. Monitor logs + error rates for 2 weeks.
3. After confirmed parity, delete `legacy/` from the repository.

