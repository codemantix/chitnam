import { createHash } from "crypto";

/**
 * Small helpers for API routes. Server only.
 */

/** Best-effort client IP (first X-Forwarded-For entry on Vercel/proxies). */
export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return (first || req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown").trim();
}

/**
 * One-way hash of an IP so we can rate-limit without storing raw IPs.
 * The salt comes from RATE_LIMIT_SALT; without it the hash is still
 * computed but is easier to reverse, so set it in production.
 */
export function hashIp(ip) {
  const salt = process.env.RATE_LIMIT_SALT || "chitnam-dev-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Rejects cross-site requests: when the browser sends an Origin header it
 * must match this site's host. Protects cookie-authenticated admin routes
 * from CSRF and stops other sites posting into the enquiry form.
 */
export function isSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // Non-browser clients and same-origin GETs may omit it.
  try {
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Sends a JSON error in a consistent shape. */
export function sendError(res, status, message, extra = {}) {
  return res.status(status).json({ ok: false, message, ...extra });
}

/** Restricts a route to the given methods; returns false (and responds) otherwise. */
export function allowMethods(req, res, methods) {
  if (methods.includes(req.method)) return true;
  res.setHeader("Allow", methods.join(", "));
  sendError(res, 405, "Method not allowed.");
  return false;
}
