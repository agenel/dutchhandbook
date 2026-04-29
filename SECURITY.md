# Security (More Dutch)

This repository contains a production web application (Angular SSR + NestJS).
Security-sensitive behavior is intentional; please read before deploying.

## Browser security

- **Sessions**: cookie-based (`HttpOnly`, `Secure` in production, `SameSite=Strict`).
- **CSRF**: double-submit-cookie (`mc_csrf` cookie + `X-CSRF-Token` header). All state-changing API routes require a valid CSRF token by default.
- **Clickjacking**: API sets `X-Frame-Options: DENY` (SSR server also sets it). If you embed this site in an iframe, you must explicitly relax this.
- **HSTS**: enabled in production (`preload`, 2 years). Terminate TLS *before* the API/SSR process (typically nginx).

## Authentication

- Password hashing: **Argon2id**.
- Login throttling: global throttler guard + account lockout after repeated failures.
- Refresh tokens: rotated on `POST /api/v1/auth/refresh`.

### Email tokens

Email verification and password reset tokens are currently **logged** (dev-only) until SMTP is wired. Do not enable public registration in production until you configure an email provider.

## Deployment checklist

- Set strong secrets in environment variables:
  - `COOKIE_SECRET`
  - `DATABASE_URL`
  - `CORS_ALLOWED_ORIGINS`
- Put nginx in front:
  - TLS, compression, rate limiting, request size limits
- Enable backups for Postgres (`pg_dump` or managed backups).

## Dependency security

CI should run:

- `npm audit` (informational)
- `npm run lint`
- `npm run test`

Dependabot is enabled via `.github/dependabot.yml`.

## Reporting vulnerabilities

If you discover a security issue, do not open a public issue. Contact the maintainer privately.

