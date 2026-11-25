import { ENQUIRY_LIMITS } from "@/constants/enquiry";
import { allowMethods, getClientIp, hashIp, isSameOrigin, sendError } from "@/lib/http";
import { checkRateLimit } from "@/lib/rateLimit";
import { getAdminClient } from "@/lib/supabase/adminClient";
import { getSetting } from "@/services/settings";
import { insertEnquiry } from "@/services/enquiries";
import { hasErrors, validateEnquiry } from "@/utils/validation";

export const config = {
  api: { bodyParser: { sizeLimit: "16kb" } },
};

/**
 * POST /api/enquiries — public enquiry form endpoint (Apply and Contact).
 *
 * 1. Same-origin and method checks
 * 2. Spam traps: hidden honeypot field + minimum time to fill the form.
 *    Bots get a normal-looking success response and nothing is stored.
 * 3. Server-side validation (same rules as the browser)
 * 4. Rate limit per hashed IP
 * 5. Insert with the service-role client
 */
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  res.setHeader("Cache-Control", "no-store");

  if (!isSameOrigin(req)) return sendError(res, 403, "Request not allowed.");
  if (!req.headers["content-type"]?.includes("application/json"))
    return sendError(res, 415, "Send the form as JSON.");

  const body = req.body && typeof req.body === "object" ? req.body : {};

  // --- Spam traps ---------------------------------------------------------
  const honeypotFilled = typeof body.website === "string" && body.website.trim() !== "";
  const startedAt = Number(body.startedAt);
  const tooFast = !Number.isFinite(startedAt) || Date.now() - startedAt < ENQUIRY_LIMITS.minFillMs;
  if (honeypotFilled || tooFast) {
    return res.status(200).json({ ok: true });
  }

  const admin = getAdminClient();
  if (!admin) {
    console.error("[enquiries] Supabase is not configured (URL / service-role key missing).");
    return sendError(res, 503, "Our enquiry form is temporarily unavailable. Please call or email us instead.");
  }

  // --- Validation ---------------------------------------------------------
  const source = body.source === "contact" ? "contact" : "apply";
  // Settings → Enquiries can make the phone number required on the contact form.
  const { requirePhoneOnContact } = await getSetting(admin, "enquiries");
  const { data, errors } = validateEnquiry(body, source, { requirePhone: requirePhoneOnContact });
  if (hasErrors(errors)) {
    return sendError(res, 400, "Please correct the highlighted fields.", { errors });
  }

  // --- Rate limit ---------------------------------------------------------
  const ipHash = hashIp(getClientIp(req));
  const allowed = await checkRateLimit(admin, `enquiry:${ipHash}`, {
    limit: ENQUIRY_LIMITS.maxPerWindow,
    windowSeconds: ENQUIRY_LIMITS.windowSeconds,
  });
  if (!allowed) {
    res.setHeader("Retry-After", String(ENQUIRY_LIMITS.windowSeconds));
    return sendError(res, 429, "You've sent several enquiries in a short time. Please wait a few minutes and try again.");
  }

  // --- Save ---------------------------------------------------------------
  try {
    await insertEnquiry(admin, {
      ...data,
      consent_at: new Date().toISOString(),
      ip_hash: ipHash,
      user_agent: String(req.headers["user-agent"] || "").slice(0, 300) || null,
    });
  } catch (error) {
    console.error("[enquiries]", error.message);
    return sendError(res, 500, "Something went wrong saving your enquiry. Please try again, or call us.");
  }

  return res.status(201).json({ ok: true });
}
