# Authentication And Signature Gate

## Overview

This project uses two layers before users can access app pages:

1. Signature gate (`?s=` + `?h=`) validated server-side in `middleware.ts`.
2. Authentication flow (`/login`) using conditional domain routing (password or SSO).

All app pages require login by default. `/email-signature` may bypass login only
when decoded `?s` payload contains `hash` matching `SIGNATURE_BYPASS_HASH`.

## Environment Setup

Configure these values in `.env`:

- `POSTGRES_PRISMA_URL` (or `DATABASE_URL` / `POSTGRES_URL` fallback)
- `POSTGRES_URL_NON_POOLING` (for migrations/introspection)
- `POSTGRES_SSLMODE` (optional explicit TLS mode)
- `POSTGRES_SSL_INSECURE` (optional, `true` to allow self-signed chains)
- `AUTH_SECRET`
- `AUTH_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `SIGNATURE_SECRET_KEY`
- `SIGNATURE_BYPASS_HASH`
- `SSO_PROVIDERS_JSON`

## Database Setup

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init-auth
npx prisma db seed
```

The seed script creates or updates the admin account from `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH`.

## Adding SSO Tenants

1. Add provider credentials to `SSO_PROVIDERS_JSON`.
2. Add a `SsoDomainMapping` row with:
   - `domain`: email domain (lowercase)
   - `providerKey`: key used in `SSO_PROVIDERS_JSON`
   - `enforceSso: true`
   - `isActive: true`

Example SQL (SQLite):

```sql
INSERT INTO SsoDomainMapping (id, domain, providerKey, enforceSso, isActive, createdAt, updatedAt)
VALUES ('cuid-placeholder', 'plrei.com', 'ms_plrei', 1, 1, datetime('now'), datetime('now'));
```

## Admin Exception

`ADMIN_EMAIL` always uses password authentication.

- Even if the domain is SSO-mapped, `POST /api/auth/discover` returns password mode.
- Auth.js callback blocks non-credentials providers for the admin account.

## Signature Link Generation (`s` payload with embedded hash)

- `s` is base64url-encoded JSON payload of signature fields.
- The decoded payload must include `hash` and match `SIGNATURE_BYPASS_HASH`.
- `/api/signature-link` injects that hash for generated share links.

Server helper endpoint:

- `POST /api/signature-link` with `{ "s": "<base64url-payload>" }`
- Returns `{ "s": "<base64url-payload-with-hash>" }`

Example email-template-side hash generation (Node.js):

```ts
import crypto from 'crypto';

const payloadJson = JSON.stringify({
  name: 'Jack Veney',
  title: 'Technology Specialist',
  office: '330-982-0021',
  mobile: '330-464-1814',
  email: 'jackveney@plrei.com'
});

const s = Buffer.from(payloadJson, 'utf8').toString('base64url');
const payload = JSON.parse(payloadJson);
payload.hash = process.env.SIGNATURE_BYPASS_HASH;
const signedS = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
const link = `https://your-app/email-signature?s=${encodeURIComponent(signedS)}`;
```

## Troubleshooting

- Redirect to login on `/email-signature`: verify `s` exists, includes `hash`, and
  that `hash` matches `SIGNATURE_BYPASS_HASH`.
- SSO discover returns password unexpectedly: verify `SsoDomainMapping` row and provider key.
- SSO provider missing: verify `SSO_PROVIDERS_JSON` includes the mapped provider key.
- Admin SSO blocked: expected behavior for `ADMIN_EMAIL`.
