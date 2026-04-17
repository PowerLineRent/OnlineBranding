#!/usr/bin/env node
/**
 * Prisma migration script for Vercel builds.
 *
 * Requires a direct (non-pooled) database connection via POSTGRES_URL_NON_POOLING.
 * Prisma's migration engine uses advisory locks which are incompatible with
 * transaction-mode connection poolers (e.g. Supabase port 6543).
 *
 * If POSTGRES_URL_NON_POOLING is not set, migrations are skipped and a warning
 * is printed. Set this variable in Vercel → Project Settings → Environment Variables
 * using the "Direct connection" string from Supabase → Project Settings → Database.
 */

const { execSync } = require('child_process');

const directUrl =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_DIRECT_URL ||
  '';

const isPoolerUrl = directUrl.includes(':6543') || directUrl.includes('pooler.supabase.com');

if (!directUrl || directUrl === process.env.POSTGRES_PRISMA_URL || isPoolerUrl) {
  console.warn(
    '\n[migrate] WARNING: POSTGRES_URL_NON_POOLING is not set or points to the connection pooler.\n' +
    '[migrate] Skipping migrations — schema changes will NOT be applied until a direct connection is configured.\n' +
    '[migrate] Set POSTGRES_URL_NON_POOLING in Vercel env vars using the direct connection string from\n' +
    '[migrate] Supabase → Project Settings → Database → Connection string → URI (port 5432, not 6543).\n'
  );
  process.exit(0);
}

function run(cmd, { ignoreError = false, timeout = 30_000 } = {}) {
  try {
    execSync(cmd, { stdio: 'inherit', timeout });
    return true;
  } catch (err) {
    if (!ignoreError) throw err;
    return false;
  }
}

run('npx prisma migrate resolve --applied 20260416193956_init_auth', { ignoreError: true });
run('npx prisma migrate deploy', { timeout: 60_000 });
