import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

let client = null;

/**
 * Supabase client for the browser (admin login, image uploads).
 * Stores the session in cookies so the server can read it in
 * getServerSideProps and API routes. Returns null if not configured.
 */
export function getBrowserClient() {
  if (!isSupabaseConfigured()) return null;
  if (!client) client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}
