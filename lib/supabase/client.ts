'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(env.supabaseUrlPublic, env.supabaseAnonKeyPublic, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return browserClient;
}
