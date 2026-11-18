// @ts-check

/**
 * Next.js configuration (Pages Router).
 *
 * - trailingSlash keeps the URL shape of the old WordPress site
 *   (/about-us/, /contact-us/ …) so existing links and rankings carry over.
 * - Redirects use an explicit 301 status for URLs that no longer exist.
 *   See docs/PROJECT_PLAN.md for the redirect map and the reasoning.
 */

const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : null;
  } catch {
    return null;
  }
})();

const isProd = process.env.NODE_ENV === "production";
const supabaseOrigin = supabaseHost ? `https://${supabaseHost}` : "";

/**
 * Content Security Policy, production builds only (the dev server needs
 * eval and websockets for hot reload).
 *
 * - Scripts: only from this site. 'unsafe-inline' is needed because the
 *   Turbopack build adds a small inline bootstrap script to every page. A
 *   nonce would force every page to render per request (losing static
 *   pages and ISR), and hashes change on every build. No eval, no external
 *   script hosts. See docs/DEPLOYMENT.md → "Content Security Policy".
 * - Styles: inline allowed for next/font, next/image and styled-jsx.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseOrigin}`,
  "font-src 'self'",
  `connect-src 'self' ${supabaseOrigin} ${supabaseHost ? `wss://${supabaseHost}` : ""}`,
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
]
  .map((d) => d.replace(/\s+/g, " ").trim())
  .join("; ");

const productionHeaders = isProd
  ? [
      { key: "Content-Security-Policy", value: contentSecurityPolicy },
      // One year, this host only. includeSubDomains/preload are left off
      // until every subdomain (mail, cPanel…) is confirmed to serve HTTPS;
      // see docs/DEPLOYMENT.md. Browsers ignore HSTS over plain HTTP.
      { key: "Strict-Transport-Security", value: "max-age=31536000" },
    ]
  : [];

const permanent = (source, destination) => ({
  source,
  destination,
  statusCode: 301,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: true,

  images: {
    formats: ["image/avif", "image/webp"],
    // 55 for full-width photos behind dark overlays (artefacts are invisible
    // there, and they are the LCP image); 75 for everything else.
    qualities: [55, 75],
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },

  async redirects() {
    return [
      // Old blog index (WordPress page slug)
      permanent("/blog-2-2-3", "/blog/"),

      // Theme demo posts: /2019/09/06/some-post/ etc.
      permanent("/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug", "/blog/"),
      permanent("/category/:slug", "/blog/"),
      permanent("/feed", "/blog/"),
      permanent("/comments/feed", "/blog/"),

      // Theme demo custom post types
      permanent("/teams/:slug", "/about-us/"),
      permanent("/testimonials/:slug", "/"),
      permanent("/portfolios/:slug", "/"),
    ];
  },

  async headers() {
    return [
      {
        // Skip Next's dev-only manifests: some are served as JSON but loaded
        // as scripts, which `nosniff` blocks. Doesn't affect production.
        source: "/((?!_next/static/development/).*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          ...productionHeaders,
        ],
      },
      // Private areas: never indexed, never cached by shared caches.
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

module.exports = nextConfig;
