import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

let client = null;

/**
 * Anonymous, session-less client for build-time and ISR data fetching
 * (getStaticProps). Row Level Security limits it to published posts,
 * categories and authors.
 */
export function getPublicClient() {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
