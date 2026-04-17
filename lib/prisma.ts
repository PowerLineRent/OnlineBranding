import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function asBoolean(value: string | undefined): boolean {
  if (!value) return false;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function resolveSslMode(currentMode: string | null): string {
  const explicitSslMode = process.env.POSTGRES_SSLMODE?.trim() || process.env.PGSSLMODE?.trim();
  if (explicitSslMode) return explicitSslMode;

  // Optional escape hatch for environments with intercepting proxies or self-signed chains.
  if (asBoolean(process.env.POSTGRES_SSL_INSECURE)) return 'no-verify';

  // Avoid pg's upcoming behavior shift warning and keep strict verification.
  if (currentMode === 'prefer' || currentMode === 'require' || currentMode === 'verify-ca') {
    return 'verify-full';
  }

  return currentMode || 'verify-full';
}

function normalizePostgresConnectionString(rawConnectionString: string): string {
  if (!rawConnectionString) return rawConnectionString;

  let url: URL;
  try {
    url = new URL(rawConnectionString);
  } catch {
    return rawConnectionString;
  }

  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    return rawConnectionString;
  }

  const sslMode = resolveSslMode(url.searchParams.get('sslmode'));
  url.searchParams.set('sslmode', sslMode);

  // Enables libpq-compatible interpretation when explicitly requested.
  if (asBoolean(process.env.POSTGRES_USE_LIBPQ_COMPAT)) {
    url.searchParams.set('uselibpqcompat', 'true');
  }

  return url.toString();
}

function createPrismaClient(): PrismaClient {
  const rawConnectionString =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    '';
  const connectionString = normalizePostgresConnectionString(rawConnectionString);

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
