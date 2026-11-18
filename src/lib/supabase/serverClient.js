import { createServerClient, serializeCookieHeader } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

/**
 * Supabase client bound to the current request's auth cookies.
 * For getServerSideProps (pass ctx.req / ctx.res) and API routes.
 *
 * Queries run as the signed-in user, so Row Level Security applies.
 * Refreshed session cookies are written back to the response.
 *
 * @param {import('http').IncomingMessage & { cookies: Record<string,string> }} req
 * @param {import('http').ServerResponse} res
 */
export function getServerClient(req, res) {
  if (!isSupabaseConfigured()) return null;

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return Object.entries(req.cookies || {}).map(([name, value]) => ({ name, value: value ?? "" }));
      },
      setAll(cookiesToSet, headers) {
        if (res.headersSent) return;
        const existing = res.getHeader("Set-Cookie");
        const previous = Array.isArray(existing) ? existing : existing ? [String(existing)] : [];
        res.setHeader("Set-Cookie", [
          ...previous,
          ...cookiesToSet.map(({ name, value, options }) => serializeCookieHeader(name, value, options)),
        ]);
        // Supabase may ask for headers such as Cache-Control: private, no-store
        // so responses carrying auth cookies are never cached.
        Object.entries(headers || {}).forEach(([key, value]) => res.setHeader(key, value));
      },
    },
  });
}
