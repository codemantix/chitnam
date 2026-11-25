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

/**
 * Base URL for links we email or share (e.g. team invitations). On the live
 * site this is always NEXT_PUBLIC_SITE_URL; elsewhere (local dev, previews)
 * it follows the request so the link opens the same deployment.
 */
export function publicOrigin(req) {
  if (process.env.NEXT_PUBLIC_SITE_ENV === "production" && process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  }
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || (/^(localhost|127\.0\.0\.1)(:|$)/.test(host || "") ? "http" : "https");
  return `${String(proto).split(",")[0]}://${host}`;
}

/** localhost, loopback, private networks and .local/.localhost/.test names. */
export function isLocalHost(hostname = "") {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return (
    host === "localhost" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    /\.(localhost|local|test|internal)$/.test(host) ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    /^169\.254\./.test(host)
  );
}

/**
 * The ONLY base URL used for links inside emails (invitations, password
 * resets). It comes from NEXT_PUBLIC_SITE_URL and must be a public https
 * address — never the request's host, never localhost. Returns null when
 * no such address is configured (e.g. local development), in which case
 * callers must not send email.
 */
export function emailBaseUrl() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || isLocalHost(url.hostname)) return null;
    return `${url.origin}`;
  } catch {
    return null;
  }
}

export const EMAIL_DISABLED_REASON =
  "Emails are only sent from the live website, so the link in them always points to the public address. This site's NEXT_PUBLIC_SITE_URL isn't a public https address.";
