#!/usr/bin/env node
/**
 * Prisma migration script for Vercel builds.
 *
 * Baselines the init migration on databases set up outside Prisma (P3005),
 * then deploys any pending migrations. Migration commands use a 30-second
 * timeout to prevent hanging on pooler connections — Prisma migrate requires
 * a direct (non-pooled) connection via POSTGRES_URL_NON_POOLING.
 */

const { execSync } = require('child_process');

const TIMEOUT_MS = 30_000;

function run(cmd, { ignoreError = false } = {}) {
  try {
    execSync(cmd, { stdio: 'inherit', timeout: TIMEOUT_MS });
    return true;
  } catch (err) {
    if (!ignoreError) {
      throw err;
    }
    return false;
  }
}

// Baseline the init migration. No-op if already recorded; ignored if it times
// out on a fresh pooler-only environment (migrations will still proceed).
run(
  'npx prisma migrate resolve --applied 20260416193956_init_auth',
  { ignoreError: true }
);

// Deploy all pending migrations.
run('npx prisma migrate deploy');
