import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

/**
 * SERVER ONLY. Supabase client using the service-role key, which bypasses
 * Row Level Security. Use it only in API routes, after validating input,
 * for operations the public must be allowed to perform indirectly
 * (inserting an enquiry, checking a rate limit). Never import from a
 * component or any code that runs in the browser.
 */
export function getAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("getAdminClient() must never run in the browser.");
  }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) return null;

  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
