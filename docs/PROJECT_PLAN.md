# Chitnam Penguins Links — Rebuild Plan

Working reference for the rebuild. Update it as decisions are confirmed with the client.

## 1. Audit of the existing site (reviewed 18 Nov 2026)

The current site is a WordPress theme (Elementor + Revolution Slider). Only eight
pages carry real content; the rest is theme demo material.

### Content worth keeping

| Item | Source page | Status |
| --- | --- | --- |
| Agency established 2015, HQ in Port Harcourt, Rivers State | Home, About | Keep |
| "Jointly owned and managed by three seasoned partners" | Home, About | Keep — confirm partner names |
| Mission (end-to-end support for study in Australia) | About | Keep — confirm if still Australia-only |
| Vision statement | About | Keep, light edit |
| Four services and their descriptions | Services | Keep, expand |
| Admission stages: application, assessment, offer, acceptance | Services | Keep |
| Visa extension/renewal and graduate work visa help | Services | Keep — confirm still offered |
| Staff: Ruth I. Badiru (Head of Information and Communications), Chris B. Nwibor (Head of Operations), Ruth T. Adamu (Head of Recruitment and Admissions) | About | **Confirm** current roles and consent to publish |
| Address: 29 Ohiamini Crescent, Rumuola Link Road, Rumuigbo, Port Harcourt, Rivers State | Footer, Contact | **Confirm** |
| Phones: 07064465640, 09081856122, +447904866340, 08064249428 (contact-page link only) | Footer, Contact | **Confirm** which are current, which is WhatsApp, what the UK number is for |
| Email: info@chitnampenguinslink.com.ng (one link points to `.com`) | Footer, Contact | **Confirm** |
| Facebook page (profile id 100046438376487) | Header | Keep |
| Anti-fraud notice about unauthorised event invitations (2025) | Disclaimer | Keep, update year/wording with client |
| Logo (green CP book mark, `#17B156`) | Header | Keep — request vector/SVG original |
| Event photographs (staff at desks, branded shirts) | Home, About | Keep — request originals at higher resolution |
| Partner logo collages (Australia, UK, Netherlands, Canada, USA institutions) | Partners, Home | Published at the client's request (18 Nov 2026); keep the list current |
| Motto "Education: A New Dimension" | About, roll-up banner photo | Used in homepage hero caption |
| Roll-up banner (photo, c. 2018): destinations USA, UK, Canada, Australia, Poland, Dubai; undergraduate (A levels, foundation, bachelor's) and postgraduate (PG cert, PG diploma, master's, PhD) programmes | Home page photo | Confirmed by the client (18 Nov 2026); the countries are the enquiry form's destination options |

### Content to remove

- "97% success rate", "99+ universities", "99% admission success", "95% visa success",
  "award winning company" — unverified claims.
- All testimonials (lorem ipsum under placeholder names).
- All 48 blog posts, 90 portfolio items, demo team pages, WooCommerce product
  sitemaps — theme demo content.
- Twitter and Google+ icons that link nowhere.

### Existing URLs and redirect plan

| Old URL | New URL | Type |
| --- | --- | --- |
| `/`, `/about-us/`, `/our-services/`, `/partners/`, `/contact-us/`, `/apply-now/`, `/disclaimer/` | Same | Preserved |
| `/blog-2-2-3/` | `/blog/` | 301 |
| `/teams/:slug/` | `/about-us/` | 301 |
| `/YYYY/MM/DD/:slug/` (demo posts) | `/blog/` | 301 |
| `/category/:slug/` | `/blog/` | 301 |
| `/testimonials/:slug/`, `/portfolios/:slug/` | `/` | 301 |
| `/feed/`, `/comments/feed/` | `/blog/` | 301 |
| `/wp-admin`, `/wp-login.php` | 410/404 (no redirect) | — |

Demo posts are redirected rather than left to 404 because some have been
crawled; the content was never real, so pointing them at the blog index is the
honest destination.

## 2. Folder structure

**Architecture: Next.js Pages Router** (changed from App Router on client
instruction). Public pages use `getStaticProps`/`getStaticPaths` with ISR;
`/api/*` handles forms; `/admin/*` uses `getServerSideProps` for session checks.

```
src/
  pages/
    _app.js  _document.js  index.js  404.js
    about-us.js  partners.js  apply-now.js  contact-us.js
    privacy-policy.js  disclaimer.js
    our-services/       index.js, [slug].js
    blog/               index.js, [slug].js   (ISR from Supabase)
    admin/              protected dashboard (getServerSideProps auth check)
    api/                enquiry endpoints, revalidation
    sitemap.xml.js      server-generated sitemap (Phase 5)
    dev/foundation.js   design-system reference, dev only
  components/
    ui/                 Button, Container, SectionHeading, ServiceCard,
                        Breadcrumb, SEO … (each: Component.jsx + .module.css)
    layout/             Header, Navbar, Footer, PageLayout
    home/               one folder per homepage section
    services/ destinations/ blog/ forms/ admin/
  styles/               variables.css (tokens), globals.css, pages/*.module.css
  config/site.js        business details with `verified` flags
  constants/routes.js   paths and navigation
  data/                 static, versioned copy (services, destinations,
                        partners, FAQs, team)
  utils/                cn, seo, schema, validation
  hooks/                shared hooks
  lib/supabase/         browser, server (req/res cookies) and admin clients
  services/             server-side data access (posts, enquiries, auth)
supabase/
  migrations/           SQL: tables, RLS policies, storage bucket
public/
  images/ icons/ fonts/
  robots.txt            (Phase 5; environment-aware)
docs/
```

## 3. Design system

**Character:** editorial and calm. Large serif display headings set against a
neutral sans body, generous whitespace, real photographs cropped with
intention, hairline rules instead of card shadows.

**Colour (from current logo):**

| Token | Value | Use |
| --- | --- | --- |
| `brand-600` | `#17B156` | Logo green; accents, icons, focus ring on dark |
| `brand-700` | `#0F8A42` | Buttons and links (4.9:1 on white, passes AA) |
| `brand-800` | `#0B6B33` | Hover |
| `brand-50` | `#EEF8F1` | Tinted section background |
| `ink-900` | `#14171A` | Headings, body |
| `ink-600` | `#4A525A` | Secondary text |
| `ink-300` | `#C9CED3` | Borders |
| `paper` | `#FAFAF7` | Page background (warm off-white) |
| `sand-100` | `#F2EFE8` | Alternate section background |

Plain `#17B156` on white is ~2.8:1, so it is never used for text.

**Type:** Fraunces (display serif, headings) + Inter (body/UI), loaded with
`next/font` (self-hosted, `display: swap`). Fluid scale via `clamp()`:
display, h1, h2, h3, lead, body, small, eyebrow.

**Spacing:** Tailwind's 4px scale; sections use `py-16 md:py-24 lg:py-32`.
**Grid:** 12 columns, `max-w-7xl`, 16px gutter at 320px, 24px at md, 32px at lg.
Text measure capped at ~65ch.

**Radius:** 2px on inputs and buttons, 0 on images. **Shadows:** none by default; a
single subtle shadow token for the sticky header and menus.

**Motion:** 150–250ms ease-out on hover and focus; an optional fade-up on
section entry using CSS only. Everything is disabled under
`prefers-reduced-motion`.

**Focus:** 2px `brand-700` outline with 2px offset on every interactive element.

**Styling split:** Tailwind for layout, spacing, responsive behaviour and simple
colour; CSS Modules for pseudo-elements, transitions, animations and composed
visual treatments. Tokens are defined once in `styles/variables.css` and
exposed to Tailwind with `@theme inline`.

**Components built in Phase 1:** Container, Button (primary/secondary/ghost/
inverse; Link, external `<a>` or `<button>`; loading state), SectionHeading,
ServiceCard, Breadcrumb, SEO (`next/head`).
**Planned:** PageLayout, Header, Navbar (mobile menu), Footer, PageHeader,
ProcessSteps, FAQ (native `<details>`), CTA band, form fields, Alert, Prose,
Skeleton.

## 4. Supabase schema

Enquiries and blog content live in separate tables with separate policies.

### `enquiries` (private, PII)
| column | type | notes |
| --- | --- | --- |
| id | uuid pk | `gen_random_uuid()` |
| created_at | timestamptz | default now() |
| source | text | `apply` or `contact` |
| full_name | text | required, ≤120 |
| email | text | required |
| phone | text | required for apply |
| destination | text | nullable |
| study_level | text | nullable |
| field_of_interest | text | nullable |
| message | text | ≤2000 |
| consent | boolean | must be true |
| consent_at | timestamptz | |
| status | text | `new`, `contacted`, `closed` |
| ip_hash | text | SHA-256 of IP + salt, for rate limiting only |
| user_agent | text | truncated |

RLS on, **no anon policies**. Inserts happen only from the server with the
service-role key after validation. Staff may `select`/`update` status.

### `staff_profiles`
| id uuid pk → auth.users | full_name | role (`editor` / `admin`) | created_at |

Used by `is_staff()` SQL helper and the admin UI. Accounts are invited from the
Supabase dashboard; public sign-up is disabled.

### `categories`
| id | slug unique | name | description | sort_order |

### `authors`
| id | slug unique | name | role | bio | avatar_path |

Kept separate from `staff_profiles` so a byline doesn't require a login.

### `posts`
| column | type |
| --- | --- |
| id | uuid pk |
| slug | text unique |
| title | text |
| excerpt | text |
| body | text (Markdown) |
| cover_image_path | text |
| cover_image_alt | text |
| category_id | fk categories |
| author_id | fk authors |
| status | `draft` / `published` |
| published_at | timestamptz |
| seo_title, seo_description | text |
| created_at, updated_at | timestamptz |
| search | tsvector generated (title, excerpt, body) |

RLS: anon may select only `status = 'published' and published_at <= now()`;
staff may do everything.

### `rate_limits`
| key text | window_start timestamptz | count int | pk(key, window_start) |

Fixed-window counter used by the enquiry endpoint via an RPC
(`hit_rate_limit(key, limit, window_seconds)`), so limits hold across
serverless instances.

### Storage
Bucket `blog-images`: public read, write restricted to staff via storage
policies. No bucket for student documents — the enquiry form does not
collect files.

## 5. Phases

| Phase | Scope | Exit check |
| --- | --- | --- |
| 1 Foundation | Next.js 16 Pages Router (JS), Tailwind 4 + CSS Modules, tokens, fonts, site config, shared UI components, 404, `.env.example`, redirects, README | `npm run build` and `npm run lint` pass; old URLs 301; Tailwind and modules verified together |
| 2 Layout + homepage | Header, Navbar, Footer, PageLayout, homepage sections | Visual QA at 320/375/768/1280; Lighthouse spot check |
| 3 Core pages | About, Services overview and 4 detail pages, destinations listing and Australia template, partners, contact page layout, disclaimer, privacy | All pages have content flagged where unverified |
| 4 Applications + CMS | SQL migrations, RLS, enquiry API with validation/honeypot/rate limit, apply and contact forms, admin login, post editor, image upload, blog index/search/category/article | End-to-end submit and publish tested against a Supabase project |
| 5 SEO, QA, deploy | JSON-LD (Organization, LocalBusiness, Breadcrumb, Article, FAQ), OG images, sitemap from DB, analytics hooks, a11y audit, Lighthouse, security headers, deployment notes | Lighthouse ≥90 on key pages; checklist complete |

## 6. Open questions for the client

1. Which destinations are actively supported today? (The roll-up banner lists
   USA, UK, Canada, Australia, Poland and Dubai; partner collages show
   Australia, UK, Netherlands, Canada and USA; mission mentions only Australia.)
2. Written confirmation of each partner institution, plus permission to show logos.
3. Current phone numbers, which accepts WhatsApp, and what the +44 number is.
4. Correct email address (`.com.ng` vs `.com`).
5. Office hours.
6. Current team members, roles, photos and consent to publish.
7. Names of the three founding partners and any professional credentials
   (e.g. trained agent certifications such as PIER/QEAC, British Council
   training) — only publishable with evidence.
8. Genuine student testimonials with written consent.
9. Original logo files (SVG/AI) and high-resolution photographs.
10. Is the 2025 events notice still current or should it be updated?
11. Domain and hosting for the new site (Vercel recommended).
12. Is the first consultation free, and are there service fees? (Not stated
    anywhere; the site currently says nothing about cost.)
13. Approve the homepage wording derived from the old site — in particular
    "small agency by choice" (from "boutique agency"), the five-step process,
    the planning advice ("nine to twelve months before your intake") and the
    "What we don't promise" statement. Source: `src/data/home.js`.
14. Higher-resolution versions of the event photos. The about-section photos are
    only 350px wide and look soft on high-density screens.

## 7. Phase log

### Phase 2 — layout and homepage (18 Nov 2026)

Lighthouse 13.6 against a local production build (`next start`), homepage:

| Run | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mobile (3 runs) | 95–96 | 100 | 100 | 63* | 2.7–2.9 s | 0 | 10–30 ms |
| Desktop | 100 | 100 | 100 | 63* | 0.6 s | 0 | 0 ms |

\* SEO is 63 only because every page is `noindex` until `NEXT_PUBLIC_SITE_ENV=production`.

Simulated mobile LCP is slightly above the 2.5 s target. Re-measure on the real
host in Phase 5 (CDN, HTTP/2, image cache) before further tuning.

Fixes made during testing: hero `clip-path` animation replaced with a composited
transform (TBT 1,100 ms → ~10 ms); `brand-700` darkened to pass AA on sand;
Fraunces optical-size axis dropped (66 KB → 36 KB); mobile menu scroll lock
released on route change.

### Design change — Poppins headings and hero carousel (18 Nov 2026)

- Headings now use **Poppins** (500/600); body stays Inter. Type scale reduced
  slightly because Poppins is wider than the previous serif.
- The hero is now a **content carousel** (client request). The original brief
  advised against auto-rotating hero carousels, so autoplay is **off by default**;
  enable it with `<HeroSection autoplayMs={7000} />` in `src/pages/index.js`.
  When on it shows a pause button, pauses on hover/focus and never runs under
  `prefers-reduced-motion`. The h1 ("Study abroad consultants in Port Harcourt")
  stays fixed for SEO; slide headlines are h2s. Slide copy: `heroSlides` in
  `src/data/home.js`. CTAs pass `?interest=` to the Apply form (Phase 4).

### Phase 3 — core pages (18 Nov 2026)

Pages: About, Services (overview + 4 detail pages), Study destinations
(listing + Australia), Partners, Contact, Disclaimer, Privacy policy.

Verified in a production build: all 13 public pages return 200, each has one h1,
a unique title, a meta description and JSON-LD; no horizontal overflow at
~320 px. Lighthouse mobile (home, Australia, visa service): performance 100,
accessibility 100, best practices 100, LCP 0.6–0.7 s, CLS 0.

Australian visa facts (CoE, OSHC, stay up to 6 years, 48 hours/fortnight work
during session) were checked on the Home Affairs Subclass 500 page on
18 Nov 2026. Fees are not quoted; the page links to official sources.

Known gaps:
- `/apply-now/` and `/blog/` are linked site-wide and return 404 until Phase 4.
- Contact page has no form yet; "Send an enquiry" goes to `/apply-now/` (Phase 4).
- Team section is built but hidden: set `published: true` in `src/data/team.js`
  once the client confirms names, roles and consent, and add photos.
- Partners page is `noindex` and shows a holding message until
  `src/data/partners.js` has confirmed entries.
- Some service page titles exceed ~60 characters with the site name; review in Phase 5.

Additional client approvals needed:
15. All new service, About ("Our approach") and Australia guide copy
    (`src/data/services.js`, `about.js`, `destinations.js`).
16. Privacy policy draft (`src/data/legal.js`), especially the 24-month
    retention period for non-client enquiries, ideally reviewed by a lawyer
    for NDPA 2023 compliance.
17. Disclaimer: the old 2025-specific events notice was rewritten as a general
    fraud warning without a year. Confirm wording.

### Hero images, autoplay, landscape About photo (18 Nov 2026)

- Hero carousel now **auto-advances every 7 s** (client request). It pauses on
  hover/focus, has a pause button and never runs under `prefers-reduced-motion`.
- Each slide has its own photo, cross-faded with the copy. Slide 1 is the
  agency's own photo; slides 2–4 are free Unsplash-licence photos downloaded with
  approval (see `docs/IMAGE_CREDITS.md`). All four are in the server HTML with
  descriptive alt text; inactive ones are `display:none` until page load so they
  don't compete with LCP. Alt text describes only what is shown (e.g. the stock
  photos are not described as Chitnam students).
- About and hero photos use landscape frames (3:2 and 4:3) matching the source images.
- Lighthouse mobile, homepage: performance 100, accessibility 100, LCP 0.6 s, CLS 0.

### Phase 4 — Supabase, forms, blog, admin (18 Nov 2026)

Built: Supabase schema + RLS + storage (`supabase/migrations`), enquiry API with
validation/honeypot/timing/rate limit, Apply and Contact forms, blog index (search
+ category filter) and article pages with ISR + on-demand revalidation, staff admin
(login, dashboard, post editor with toolbar/preview/image upload/SEO preview,
enquiry inbox with status and notes).

Tested against the client's Supabase project (all test records deleted afterwards):
- 15 schema/security checks: tables, seed data, public bucket; public cannot read
  or insert enquiries, read staff, call the rate-limit function, create posts or
  upload images.
- End to end: a valid enquiry submitted through `/api/enquiries/` is stored with
  cleaned fields, hashed IP and consent time, and is invisible to the public;
  rate limit allows 5 then blocks; a published post renders with BlogPosting
  JSON-LD and appears on the blog index and homepage; draft and future-dated
  posts return 404; database constraints reject invalid posts; raw `<script>` in
  an article is escaped.
- On-demand revalidation: deleting a post and revalidating removed it from the
  article URL (404), blog index and homepage immediately.
- API error paths: 405, 415, 403 cross-origin, 413 oversized, 400 with
  per-field errors, 401 for unauthenticated admin calls; bots get a silent 200.
- Markdown renderer: 12 unit tests incl. XSS, `javascript:`/`data:` URLs,
  attribute injection.
- Browser: form pre-fill from `?interest=`/`?destination=`, inline errors,
  focus moved to the first invalid field.

Found and fixed during testing: the project doesn't auto-grant new tables to API
roles → added `0002_api_grants.sql`; `trailingSlash` redirects API routes → client
code calls `/api/…/` URLs directly.

Not tested (needs a staff login, which only the client can create): signing in
to `/admin/`, saving a post through the editor, image upload as staff, updating
an enquiry's status from the inbox. These use the same API routes and RLS
policies verified above.

Additional client decisions:
18. Who should have admin vs editor access.
19. Whether staff want an email notification for each new enquiry (needs an
    email provider such as Resend or Postmark; not built).

### Admin redesign + Classic-style editor (18 Nov 2026)

- **Editor:** rich-text editor modelled on the WordPress Classic editor, built on
  Tiptap (MIT; TinyMCE now needs a commercial licence key). Visual/Text tabs,
  paragraph styles (H2–H4, preformatted), bold/italic/underline/strike/code,
  lists with indent/outdent, quotes, alignment, link dialog (new-tab option,
  auto https://), horizontal line, clear formatting, undo/redo, toolbar toggle,
  distraction-free mode, word count + reading time, WordPress keyboard shortcuts.
- **Media:** "Add Media" and "Set featured image" open a media library modal
  (drag-and-drop upload or pick an existing image; alt text required).
- **Storage format:** post bodies are now HTML, sanitised with `sanitize-html` on
  save (API) and on render (getStaticProps). 15 unit tests cover XSS vectors and
  real editor output. Migration `0003_rich_text_body.sql` raises the body limit,
  strips tags from search indexing and lets staff list the media library.
- **Admin UI:** floating rounded sidebar, soft tinted background, rounded cards
  and inputs (admin-scoped token overrides, public site unchanged), redesigned
  sign-in, dashboard (greeting, stat cards, latest enquiries/posts), posts list
  (status tabs with counts, search), enquiry inbox (expandable rounded rows,
  quick email/call actions), new-enquiry badge in the navigation.
- **Tested** in the browser via `/dev/admin-preview/`: typing, headings, bold
  shortcut, bulleted list, alignment, link dialog (focus, https prefix, new tab),
  second toolbar row, fullscreen + Escape, Visual↔Text round trip, media modal,
  sign-in page, 390 px layout without overflow. The editor is not included in
  public page bundles.
- **Not tested:** saving a post and uploading/listing images as a signed-in
  staff member — needs a staff account and migration 0003.

### Public site redesign — soft, rounded (18 Nov 2026)

Brought the public site in line with the admin's look (client request): no sharp
edges, soft depth, same brand colours and typography.

- Tokens: radii 12/16/24/32 px + pill; soft card shadows (`variables.css`).
- Tinted sections (sand, brand, ink) are now inset rounded panels instead of
  full-width bands (`Section`); inner-page headers and the footer are rounded
  tinted panels.
- Floating rounded header bar with pill navigation; softer mobile menu.
- Pill eyebrow labels; buttons with soft shadows; rounded inputs and alerts.
- Cards: services, reasons, destinations, mission/vision, approach, service
  list, FAQ items, contact details, partner logos, testimonials.
- Rounded imagery: hero (with a floating "Est. 2015 · Port Harcourt" badge
  replacing the corner bracket), about photos, blog covers, article images.
- Hero topic tabs became a segmented control; on small screens the strip fades
  at the edge and keeps the active tab in view as autoplay advances.
- Fixed: the header "Apply now" button showed on phones (its own inline-flex
  overrode `hidden`); it now hides below 640 px as intended.

Checks: lint + build clean; no horizontal overflow at 320 px on home, about,
services, Australia, contact, apply; Lighthouse mobile — home 100 (re-run; one
noisy run at 94), about/visa service/contact 100; accessibility and best
practices 100 on all four.

### Redesign in the original site's style (18 Nov 2026)

Client asked for a design that follows the original site's look (not "AI
generic"), done better, using images. Replaced the soft-panel/pill style with
the original structure:

- White header, uppercase navigation with green active state, green Apply Now.
- Full-width photo hero slider (dark overlay, centred headline, side arrows,
  topic tabs with autoplay progress, pause button).
- Photo banners with centred title and breadcrumb on every inner page.
- Services intro (heading | green rule | text) + white icon cards.
- About collage of the agency's own photos (roll-up banner + two event shots).
- "Why choose us" band with fading graduate photo and figure cards — using
  verified facts only (2015 / 4 services / 3 founding partners), NOT the old
  "99+ universities / 99% / 95%" claims.
- Services page: alternating photo/text rows (photos replace the old Storyset
  illustrations, whose free licence requires attribution).
- About page: motto as heading ("Education: A New Dimension"), circular team
  portraits (Ruth I. Badiru, Chris B. Nwibor, Ruth T. Adamu) from the old site —
  published at the developer's request; client to confirm roles are current.
- Green "Start your study abroad journey today!" band; dark footer with logo
  plate, chevron links, contact icons, Facebook only (old Twitter/Pinterest/
  LinkedIn icons linked nowhere).
- Partners: the old logo collages are still NOT shown until each partnership is
  confirmed in writing.

Images: 3 team portraits + full-size team photo from the old site; 4 new
Unsplash photos (see IMAGE_CREDITS.md). Banner/hero photos are served at
quality 55 behind their dark overlays (15–23 KB each).

Checks: lint + build clean; no overflow at 320 px on home, about, services,
Australia, contact, apply. Lighthouse mobile: performance 93–96, accessibility
100, best practices 100, CLS 0; simulated LCP 2.7–3.0 s (photo heroes) —
re-measure on the real host in Phase 5.

### Phase 5 — SEO, QA, security, deployment (18 Nov 2026)

Built:
- `/sitemap.xml` from the data files and published posts (`lastmod` from
  posts). It leaves out `noindex` pages (partners while empty, the blog while
  it has no posts).
- `/robots.txt` depends on the environment: production allows crawling,
  except `/admin/`, `/api/` and `/dev/`, and links the sitemap. Every other
  environment returns `Disallow: /`.
- Titles are kept to 60 characters or fewer (short brand fallback). This
  resolves the Phase 3 note about long service titles.
- Default 1200×630 OG image with width, height and alt. The Search Console
  verification meta is read from env and output on production only.
- Production-only Content Security Policy, plus HSTS (one year, host only)
  and COOP. `'unsafe-inline'` is kept for scripts because of Turbopack's
  inline bootstrap. Reasoning is in DEPLOYMENT.md.
- `500.js` static error page with phone and email fallback.
- Footer "Read more" link renamed "About us" (descriptive link text).
- `docs/DEPLOYMENT.md`.

Not done, on purpose:
- Analytics is not wired up. The privacy policy says the site uses no
  tracking cookies, so consent and a policy update come first (see
  DEPLOYMENT.md).

Checks:
- Crawl of a production-mode build (`SITE_ENV=production`, live domain):
  16 pages, all internal links 200.
  - One h1 per page and titles of 60 characters or fewer.
  - Descriptions are 70–160 characters, except the staff "test" post.
  - Canonical URLs match the sitemap and JSON-LD parses.
  - No duplicate titles or descriptions, and no images without alt.
- No CSP violations; Supabase auth from `/admin/login/` works under the
  policy.
- Security:
  - The service-role key and salt are not in the client bundle.
  - `npm audit` reports 0 vulnerabilities.
  - Admin APIs return 401 without a session; a cross-origin enquiry post
    returns 403.
  - The anon key cannot read private tables.
- Lighthouse mobile (local): performance 94–96, accessibility 100, best
  practices 100. SEO is 92 because of the footer link (now fixed). CLS is 0
  and simulated LCP is 2.7–3.1 s. Re-measure on the real host.

Still needs the client or staff:
- Confirm the open questions (section 6).
- Delete the `test` post.
- Test admin sign-in, publishing and upload end to end with a real staff
  account.
- Choose a host and switch DNS, following DEPLOYMENT.md.

### Social links (18 Nov 2026)

Instagram (`chitnampenguinslimited`) and LinkedIn (`chitnam-penguins-link-limited`)
were supplied by the client and added to `siteConfig.social`. They appear as
icons in the footer, as links on the contact page, and in the Organization
JSON-LD `sameAs`. This replaces the "Facebook only" note above.

### Study destinations removed (18 Nov 2026)

The client asked to drop the destinations section, because the agency
supports several countries and the site only had an Australia page. The
following were removed:
- `/study-destinations/` and `/study-destinations/[slug]/` (now 404; they
  were never live, so no redirect is needed)
- the "Destinations" menu and footer links
- the homepage destinations section
- the sitemap entries
- `src/data/destinations.js`, `src/components/destinations/` and the Sydney
  banner photo

The client confirmed the countries from the old roll-up banner, and the
enquiry form's "Preferred study destination" now lists them: United States,
United Kingdom, Canada, Australia, Poland, Dubai (UAE), plus "Another
country" and "Not sure yet". The home FAQ on countries and the one on
intakes were updated to match.

### Partner institutions published (18 Nov 2026)

The client asked for the partner logos from the old site's partners page to
be added. They are now shown:
- The three collages (January 2022) are in `public/images/partners/`:
  Australia and New Zealand (12 institutions), UK and Europe (14) and
  US and Canada (7).
- Each institution's name and country is transcribed in
  `src/data/partners.js` (`partnerGroups`). The names appear as text under
  each collage and in its alt text.
- The partners page shows one card per region, with jump links, and is now
  indexable and in the sitemap.
- The homepage "Institutions we work with" section has three region cards
  linking to the partners page.
- `PartnerGrid` was replaced by `PartnerCollage`.
- The old site's stock "puzzle globe" banner was not carried over.

Notes for the client:
- Ryerson University was renamed Toronto Metropolitan University in 2022.
  The list says so, but the collage still shows the old logo.
- The collages are three years old. If any agreement has ended, the image
  needs editing (or switch to single logos per institution).
- New Zealand and the Netherlands appear here but not in the enquiry form's
  destination list (they fall under "Another country").

### Link preview image (19 Nov 2026)

At the client's request, the default Open Graph/Twitter image is now the
original `team-consultation-desk.jpg` (1296×864) instead of a 1200×630 crop
of it. The crop file `og-default.jpg` was deleted. Blog posts with a cover
image still use their own.
