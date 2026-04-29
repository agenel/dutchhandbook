# More Dutch (Monorepo)

Website: https://moredutch.com

This repo contains the new generation of More Dutch:

- `apps/web`: Angular SSR + PrimeNG frontend (keeps the original theme)
- `apps/api`: NestJS + Prisma + PostgreSQL backend (auth + progress sync)
- `packages/shared`: shared DTOs + Zod schemas
- `legacy/`: the original static HTML/CSS/JS site (kept for parity reference)

## Local development (recommended)

### 1) Install

```bash
npm install
```

### 2) Configure env

Copy `.env.example` → `.env` and update values.

### 3) Run

Frontend:

```bash
npm run dev:web
```

Backend:

```bash
npm run dev:api
```

## Docker (dev)

```bash
docker compose -f infra/docker-compose.yml up
```

## Data migration

Legacy data lives in `legacy/data/*.js` (window globals). Convert it into JSON assets with:

```bash
node scripts/migrate-data.mjs
```

The Angular app reads the generated files under `apps/web/public/assets/data/`.

## Security

See `SECURITY.md`.

