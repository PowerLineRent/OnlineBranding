import { defineConfig } from 'prisma/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString =
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  '';

const directConnectionString =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  connectionString;

export default defineConfig({
  datasource: {
    url: connectionString,
    directUrl: directConnectionString,
  },
  seed: 'node prisma/seed.js',
});
