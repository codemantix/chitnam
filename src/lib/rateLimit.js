/**
 * Fixed-window rate limiting backed by the `hit_rate_limit` Postgres
 * function (see supabase/migrations), so limits hold across serverless
 * instances. Server only.
 *
 * Fails open (allows the request) if the database call errors, so a
 * Supabase hiccup never blocks genuine students; the error is logged.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} adminClient
 * @param {string} key e.g. "enquiry:<ip-hash>"
 * @param {{ limit: number, windowSeconds: number }} options
 * @returns {Promise<boolean>} true if allowed
 */
export async function checkRateLimit(adminClient, key, { limit, windowSeconds }) {
  const { data, error } = await adminClient.rpc("hit_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error("[rate-limit] check failed, allowing request:", error.message);
    return true;
  }
  return data === true;
}
