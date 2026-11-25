import { createClient } from "@supabase/supabase-js";
import { allowMethods, EMAIL_DISABLED_REASON, emailBaseUrl, getClientIp, hashIp, isSameOrigin, sendError } from "@/lib/http";
import { checkRateLimit } from "@/lib/rateLimit";
import { getAdminClient } from "@/lib/supabase/adminClient";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

export const config = { api: { bodyParser: { sizeLimit: "2kb" } } };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * POST /api/auth/forgot-password — { email }
 *
 * Sends Supabase's password reset email. Done on the server so the link in
 * the email always points to the public site (emailBaseUrl), never to
 * localhost or whatever host the request came from. The "implicit" flow
 * puts the session in the link itself, so it also works when the email is
 * opened on a different device from the one that asked for it.
 *
 * Always answers the same way whether or not the account exists.
 */
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  res.setHeader("Cache-Control", "no-store");
  if (!isSameOrigin(req)) return sendError(res, 403, "Request not allowed.");

  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!EMAIL.test(email) || email.length > 254) return sendError(res, 400, "Enter the email address you sign in with.");

  const base = emailBaseUrl();
  if (!base) return sendError(res, 503, EMAIL_DISABLED_REASON, { reason: "email-disabled" });

  const admin = getAdminClient();
  if (admin) {
    const ipHash = hashIp(getClientIp(req));
    const [byIp, byEmail] = await Promise.all([
      checkRateLimit(admin, `reset-ip:${ipHash}`, { limit: 5, windowSeconds: 15 * 60 }),
      checkRateLimit(admin, `reset-email:${hashIp(email)}`, { limit: 3, windowSeconds: 60 * 60 }),
    ]);
    if (!byIp || !byEmail) return sendError(res, 429, "Too many requests. Wait a few minutes, then try again.");
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${base}/admin/set-password/?mode=reset` });
  if (error) {
    console.error("[forgot-password]", error.status, error.message);
    if (error.status === 429) return sendError(res, 429, "Too many requests. Wait a few minutes, then try again.");
  }
  // Same reply whether or not the account exists (no account probing).
  return res.status(200).json({ ok: true });
}
