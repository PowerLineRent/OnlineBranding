#!/usr/bin/env node
/**
 * Prisma migration script for Vercel builds.
 *
 * On a database that was set up outside of Prisma migrations (no _prisma_migrations
 * table), `migrate deploy` fails with P3005. We baseline the init migration first
 * (marking it as already applied), then deploy any pending migrations normally.
 */

const { execSync } = require('child_process');

function run(cmd, { ignoreError = false } = {}) {
  try {
    execSync(cmd, { stdio: 'inherit' });
    return true;
  } catch {
    if (!ignoreError) throw new Error(`Command failed: ${cmd}`);
    return false;
  }
}

// Attempt to baseline the init migration. This is a no-op if it's already recorded.
run(
  'npx prisma migrate resolve --applied 20260416193956_init_auth',
  { ignoreError: true }
);

// Deploy all pending migrations (including our new one).
run('npx prisma migrate deploy');
