import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export function getSupabaseServiceRoleClient(): SupabaseClient {
  return createClient(env.supabaseUrlPublic, env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
