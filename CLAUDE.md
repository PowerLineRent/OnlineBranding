# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (auth bypass enabled — no login required)
npm run build        # Run migrations then Next.js production build
npm run lint         # ESLint
npm test             # Run Vitest test suite
npx vitest run tests/discover.test.ts   # Run a single test file

npm run prisma:migrate   # prisma migrate dev (local schema changes)
npm run prisma:generate  # Regenerate Prisma client after schema changes
npm run prisma:seed      # Seed admin user from ADMIN_EMAIL + ADMIN_PASSWORD_HASH
```

Copy `.env.example` to `.env` and fill in values before running locally.

## Architecture

### Stack
Next.js 15 App Router · TypeScript · Tailwind CSS · Prisma 7 + Supabase Postgres · NextAuth v5 (Auth.js) · Vitest

### Auth layers
Authentication has two independent layers:

1. **Middleware** (`middleware.ts`) — edge runtime, cookie presence check only. Does NOT call NextAuth JWT decode to avoid edge runtime warnings. Route handlers perform full role checks server-side.
2. **NextAuth** (`lib/auth.ts`) — JWT strategy, Prisma adapter. Providers are loaded dynamically from the database at request time via `getSsoProviders()`.

**Development bypass:** `NODE_ENV === 'development'` skips all auth gates and returns a mock admin session. This is intentional — do not add a `.env` override; just run `npm run dev`.

### SSO multi-tenant routing
`POST /api/auth/discover` — accepts an email, looks up `SsoDomainMapping` in the database, and returns either `{ mode: 'password' }` or `{ mode: 'sso', providerId: '...' }`. The login page calls this first to decide whether to show a password form or redirect to SSO.

- `SsoDomainMapping` maps email domains → provider keys
- `SsoProviderConfig` stores per-tenant OAuth credentials (client secret encrypted with `SSO_ENCRYPTION_KEY`)
- `ADMIN_EMAIL` always routes to password, even if its domain is SSO-mapped
- Admin UI at `/admin/sso` manages both tables via `app/api/admin/sso/`

### Database
- **Prisma 7** with `@prisma/adapter-pg` (Pool-based, not the default engine)
- Connection config lives in `prisma.config.ts` — **not** `schema.prisma` (Prisma 7 moved URLs out)
- `lib/prisma.ts` creates a singleton `Pool` with `ssl: { rejectUnauthorized: false }` for Supabase self-signed chain compatibility
- Migrations run via `scripts/migrate.js` at build time. The script overrides all URL env vars to `POSTGRES_URL_NON_POOLING` (session-mode pooler, port 5432) to avoid advisory lock failures on the transaction pooler (port 6543).

### Brand guidelines page (`app/page.tsx`)
Large single-page component containing all brand assets, colors, logos, letterhead, and email signature sections. Logo variants are defined as a static `AUTHORIZED_LOGO_SECTIONS` array at the top of the file.

### Email signature
`/email-signature` can be accessed without login when the `?s` query param contains a base64url-encoded JSON payload whose `hash` field matches `SIGNATURE_BYPASS_HASH`. The `POST /api/signature-link` endpoint injects this hash into a payload. See `docs/authentication.md` for the full flow.

### Brand colors (Tailwind)
| Token | Hex |
|---|---|
| `plrei-navy` | `#000080` |
| `plrei-yellow` | `#F5C518` |
| `plrei-bg-light` | `#EFF3FF` |
| `plrei-bg-border` | `#B7C5EE` |
| `plrei-text-body` | `#4A4A4B` |

## Key env vars

| Variable | Purpose |
|---|---|
| `POSTGRES_PRISMA_URL` | Pooled runtime connection (port 6543 ok for client) |
| `POSTGRES_URL_NON_POOLING` | Session-mode pooler or direct (port 5432) — migrations only |
| `AUTH_SECRET` | NextAuth signing secret; also fallback encryption key for SSO secrets |
| `ADMIN_EMAIL` | Bootstrapped admin account; always uses password auth |
| `ADMIN_PASSWORD_HASH` | bcrypt hash — upserted on each login attempt for that email |
| `SSO_ENCRYPTION_KEY` | AES key for client secrets in `SsoProviderConfig` |
| `SIGNATURE_BYPASS_HASH` | Static hash embedded in signed email signature links |

## TypeScript notes

Vercel builds use stricter TS settings than local. When mapping Prisma `findMany` results, always type the callback parameter explicitly:
```ts
type Row = (typeof rows)[number];
rows.map((row: Row) => ...)
```
