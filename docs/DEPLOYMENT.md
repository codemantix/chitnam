# Deployment and launch checklist

How to put the rebuilt site live at `chitnampenguinslink.com.ng`, replacing
the WordPress site, without losing search rankings, email or data.

---

## 1. Choose a host

The site needs a **Node.js host**. It cannot be a static export because it
uses API routes (enquiry form, admin), on-demand revalidation of blog pages
and the Next.js image optimiser.

| Option | Notes |
| --- | --- |
| **Vercel (recommended)** | Built by the Next.js team. ISR, image optimisation, HTTPS and preview deployments work with no setup. The Hobby plan is for non-commercial use, so a business site needs the Pro plan. |
| Netlify, Render, Railway | Also work with the Next.js runtime. Check that ISR and `res.revalidate()` are supported on the chosen plan. |
| Your own VPS | `npm ci && npm run build && npm start` behind Nginx or Caddy for HTTPS, kept running with a process manager (pm2 or systemd). |
| cPanel shared hosting | Only if the plan has "Setup Node.js App" and enough memory to build. Usually unreliable for Next.js, so not recommended. |

The rest of this guide assumes Vercel. The steps on other hosts are the same,
but the settings live in a different place.

---

## 2. Environment variables

Set these in **Vercel → Project → Settings → Environment Variables**.

> `NEXT_PUBLIC_*` values are written into the JavaScript **at build time**.
> After changing one, redeploy. Changing it alone does nothing.

| Variable | Production | Preview / staging | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://chitnampenguinslink.com.ng` | the preview URL | No trailing slash. Used for canonicals, sitemap, Open Graph and JSON-LD. |
| `NEXT_PUBLIC_SITE_ENV` | `production` | `preview` | Anything except `production` makes every page `noindex` and robots.txt `Disallow: /`. |
| `NEXT_PUBLIC_SUPABASE_URL` | project URL | same, or a staging project | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key | | Safe in the browser. Row Level Security protects the data. |
| `SUPABASE_SERVICE_ROLE_KEY` | service-role key | | **Server only.** Never add a `NEXT_PUBLIC_` prefix. Mark as "Sensitive" in Vercel. |
| `RATE_LIMIT_SALT` | `openssl rand -hex 32` | a different value | Used to hash IP addresses for rate limiting. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | token from Search Console | leave empty | Only the token, not the whole meta tag. Output only when `SITE_ENV=production`. |
| `ENABLE_DEV_PAGES` | leave empty | `true` if needed | Serves `/dev/` QA pages. Never on production. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | leave empty | | Reserved. Analytics is **not wired up**; see section 8. |

If a staging deployment uses the **production** Supabase project, test
enquiries and posts go into live data. Use a separate Supabase project for
staging if the client wants to test freely.

---

## 3. Supabase settings before launch

1. **Migrations.** Run the files in `supabase/migrations/` in order
   (`0001` → `0002` → `0003`), then `seed.sql`. Confirm `0003_rich_text_body.sql`
   has been run: without it, long posts and the media library fail.
2. **Authentication → Sign In / Providers**
   - Turn **off** "Allow new users to sign up". Staff accounts are created by
     an admin only (see README → Supabase setup).
   - Keep "Confirm email" on.
3. **Authentication → URL Configuration**
   - Site URL: `https://chitnampenguinslink.com.ng`
   - Redirect URLs: `https://chitnampenguinslink.com.ng/admin/**` (plus the
     staging URL if used).
4. **Authentication → Emails → SMTP.** The built-in Supabase mailer is
   rate-limited and meant for testing. For password resets, set up custom
   SMTP (for example the domain's own mailbox or a provider such as Resend or
   Brevo).
5. **Passwords.** Require at least 10 characters. Ask every staff member to
   use a password manager.
6. **Backups.** The free plan has no point-in-time recovery. Enquiries are
   personal data, so either upgrade or export the `enquiries` table regularly.
7. **Remove test content.** A published post with the slug `test` is in the
   database. Delete or unpublish it from `/admin/posts/` before launch.

---

## 4. Deploy

1. Push the repository to GitHub/GitLab and import it in Vercel. The
   framework preset is detected automatically. Build command: `next build`.
2. Add the environment variables (section 2) for Production and Preview.
3. Deploy, then test on the `*.vercel.app` URL. It is a preview, so it is
   `noindex`.
4. Check (section 6) before touching DNS.

---

## 5. DNS cutover

> **Email warning.** The current domain probably also handles email
> (`info@chitnampenguinslink.com.ng`). Change **only** the web records
> (`A` for the root, `CNAME` for `www`). **Do not** change the nameservers or
> the `MX`, `SPF`/`TXT`, `DKIM` records, or email will stop working.

1. **Back up the WordPress site** (files + database) and keep it for at
   least three months.
2. In Vercel → Domains, add `chitnampenguinslink.com.ng` and
   `www.chitnampenguinslink.com.ng`. Make the root domain primary and
   redirect `www` to it, which matches the current canonical URLs.
3. At the DNS provider, point the records as Vercel instructs. Lower the TTL
   to 300 seconds a day before so the change takes effect quickly.
4. Wait for Vercel to issue the HTTPS certificate, then load the site over
   `https://`.

### Redirects already in place

`next.config.js` sends old WordPress URLs to their new homes with a 301
(`/blog-2-2-3`, dated demo posts, `/category/*`, `/feed`, `/teams/*`,
`/testimonials/*`, `/portfolios/*`). Pages that keep their path
(`/about-us/`, `/contact-us/`, …) need no redirect. After launch, check the
Search Console "Pages → Not found (404)" report for any old URL that was
missed, and add it to `redirects()`.

---

## 6. Pre-launch checks (on the deployed URL)

- [ ] Every page loads; header, footer and mobile menu work.
- [ ] Enquiry form on `/apply-now/` and `/contact-us/` submits and the
      enquiry appears in `/admin/enquiries/`.
- [ ] Staff can sign in, create a post with an image, publish it, and see it
      on `/blog/` within a few seconds.
- [ ] `/robots.txt` on production shows `Allow: /` and the sitemap line. On
      preview, `Disallow: /`.
- [ ] `/sitemap.xml` lists only `https://chitnampenguinslink.com.ng/...` URLs.
- [ ] View source on any page: `<meta name="robots" content="index, follow…">`
      and a `<link rel="canonical">` with the live domain.
- [ ] No console errors (Content Security Policy) in the browser.
- [ ] Open Graph preview looks right (paste a URL into a WhatsApp or Facebook
      message, or use the Facebook Sharing Debugger).
- [ ] Rich results test passes for the homepage and a service page:
      https://search.google.com/test/rich-results
- [ ] Every fact marked unverified in `docs/PROJECT_PLAN.md → Open
      questions` has been confirmed by the client (address, phones, email,
      team, founding year).
- [ ] The privacy policy and disclaimer have been reviewed by the client
      (ideally by a lawyer).

---

## 7. After launch

1. **Google Search Console**: add the domain property (DNS TXT record, or
   the `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` token and a redeploy), then
   submit `https://chitnampenguinslink.com.ng/sitemap.xml`.
2. **Bing Webmaster Tools**: import from Search Console.
3. **Google Business Profile**: make sure the website link, address and
   phone numbers match the site exactly.
4. Run PageSpeed Insights on the homepage. Local Lighthouse runs scored
   94–96 for performance (simulated mobile LCP 2.7–3.1 s). Real numbers on
   Vercel's CDN are usually better. Target LCP < 2.5 s.
5. Watch the Search Console coverage and 404 reports weekly for the first
   month.

---

## 8. Security notes

### Headers

Set in `next.config.js` for every response:

| Header | Value / purpose |
| --- | --- |
| `Content-Security-Policy` | Production builds only. Scripts, styles, fonts and frames only from this site. Images and API calls also allowed to the Supabase project. No plugins, `<base>` or form targets elsewhere. The site cannot be framed. |
| `Strict-Transport-Security` | `max-age=31536000` (one year, this host only). |
| `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` | Standard hardening. |
| `X-Robots-Tag: noindex` + `Cache-Control: private, no-store` | On `/admin/*` (and noindex on `/api/*`). |

### Content Security Policy

`script-src` includes `'unsafe-inline'` because the Turbopack build adds a
small inline bootstrap script to every page. The strict alternatives each
have a cost:

- **Nonces** (a Proxy that adds a per-request nonce) force every page to
  render on each request, losing static pages, ISR and CDN caching.
- **Hashes** change on every build, so they would need a post-build step.

The policy still blocks scripts from any other host and `eval`. The main XSS
risk, blog HTML, is sanitised on save and again on render
(`src/lib/sanitizeHtml.js`). Revisit this if Next.js adds hash support for
Pages Router builds.

When adding any third-party service (analytics, chat widget, embedded
YouTube/maps), add its hosts to the matching directives in `next.config.js`
or it will be blocked.

### HSTS

`includeSubDomains` and `preload` are deliberately **off**. They would force
HTTPS on every subdomain (`mail.`, `cpanel.`, `webmail.`…), and some of those
may not have certificates. Once every subdomain is confirmed to work over
HTTPS, you can change the value to
`max-age=63072000; includeSubDomains; preload` and submit it at
https://hstspreload.org. That submission is hard to undo.

### Analytics (not enabled)

The privacy policy currently says the site uses no tracking cookies. Before
adding Google Analytics or any similar tool:

1. Update the "Cookies" section of the privacy policy (`src/data/legal.js`).
2. Add a consent banner. Under the Nigeria Data Protection Act, analytics
   cookies need consent, and the script must not load before consent is
   given.
3. Load the script with `next/script` only after consent, and add
   `https://www.googletagmanager.com` to `script-src` and
   `https://*.google-analytics.com` to `connect-src`/`img-src`.

A privacy-friendly, cookie-free alternative (for example Plausible or
Vercel Web Analytics) avoids the banner, but it still needs a line in the
privacy policy and CSP updates.

### Checks done in Phase 5 (18 Nov 2026)

- Service-role key and rate-limit salt: not present in any file under
  `.next/static` or `public`.
- `npm audit --omit=dev`: 0 vulnerabilities.
- `/admin/*` redirects to sign-in. Admin APIs return 401 without a session,
  and the enquiry API rejects cross-origin posts (403).
- The anon key cannot read `enquiries`, `staff_profiles` or `rate_limits`,
  cannot insert enquiries directly, and sees only published posts.
- `/dev/*`, `.env*` and source files return 404.

Re-run `npm audit` before every deployment, and keep `next` and
`@supabase/*` up to date.
