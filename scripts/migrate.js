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

// Port 6543 = Supabase transaction-mode pooler — advisory locks don't work there.
// Port 5432 on pooler.supabase.com = session-mode pooler — advisory locks work fine.
const isTransactionPooler = directUrl.includes(':6543');

if (!directUrl || directUrl === process.env.POSTGRES_PRISMA_URL || isTransactionPooler) {
  console.warn(
    '\n[migrate] WARNING: POSTGRES_URL_NON_POOLING is not set or points to the transaction-mode pooler (port 6543).\n' +
    '[migrate] Skipping migrations — schema changes will NOT be applied.\n' +
    '[migrate] Use the session-mode pooler (port 5432) or a direct connection for POSTGRES_URL_NON_POOLING.\n'
  );
  process.exit(0);
}

// Force ALL Prisma URL env vars to the direct connection so the migration
// engine cannot fall back to the transaction-mode pooler (port 6543).
const migrateEnv = {
  ...process.env,
  DATABASE_URL: directUrl,
  POSTGRES_PRISMA_URL: directUrl,
  POSTGRES_URL: directUrl,
};

function run(cmd, { ignoreError = false, timeout = 60_000 } = {}) {
  try {
    execSync(cmd, { stdio: 'inherit', timeout, env: migrateEnv });
    return true;
  } catch (err) {
    if (!ignoreError) throw err;
    return false;
  }
}

run('npx prisma migrate deploy');
