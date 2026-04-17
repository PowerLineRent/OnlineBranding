type RequiredEnvKey =
  | 'POSTGRES_PRISMA_URL'
  | 'POSTGRES_URL_NON_POOLING'
  | 'NEXT_PUBLIC_SUPABASE_URL'
  | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  | 'SUPABASE_SERVICE_ROLE_KEY';

function readEnv(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return '';
}

function requireEnv(name: RequiredEnvKey, ...fallbackKeys: string[]): string {
  const value = readEnv(name, ...fallbackKeys);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  // Vercel/Supabase Postgres pool URL for Prisma runtime queries.
  get prismaUrl(): string {
    return requireEnv('POSTGRES_PRISMA_URL', 'DATABASE_URL', 'POSTGRES_URL');
  },
  // Non-pooling URL for Prisma migrations/introspection.
  get prismaDirectUrl(): string {
    return requireEnv('POSTGRES_URL_NON_POOLING', 'POSTGRES_URL');
  },
  // Public client variables.
  get supabaseUrlPublic(): string {
    return requireEnv('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL');
  },
  get supabaseAnonKeyPublic(): string {
    return requireEnv(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      'SUPABASE_ANON_KEY',
      'SUPABASE_PUBLISHABLE_KEY'
    );
  },
  // Server-side secrets only.
  get supabaseServiceRoleKey(): string {
    return requireEnv('SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY');
  },
};
