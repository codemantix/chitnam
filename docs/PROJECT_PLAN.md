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

### Admin redesign and Gemini writing assistant (24 Nov 2026)

Design (client chose "deep green sidebar"):
- Dark brand-green floating sidebar with soft glows. The logo sits on a white
  plate. There is a prominent **New post** button, and the active item has
  a bright marker.
- The mobile top bar is green, with pill navigation and a New post pill.
- Stat cards have a tinted gradient per tone, gradient icon tiles and a
  decorative circle.
- The dashboard has an "AI assistant" callout (`AssistantCallout`).
- `/dev/admin-preview/?view=dashboard` previews the dashboard without
  signing in (dev only).

Writing assistant:
- `src/lib/gemini.js` is a REST client (key in header, JSON output, low
  thinking level, mapped errors). `src/lib/aiPrompts.js` holds the house
  rules and the prompts. `src/pages/api/admin/ai.js` is staff only, checks
  origin, rate-limits and sanitises output.
- `AIAssistant` dialog has three tabs: Write a draft (brief → editable
  outline → preview → replace or append), Rewrite selection (6 styles) and
  Title & SEO (Use buttons).
- `ClassicEditor` gains `apiRef` (selection, replace range, set or append
  content) and an **AI assist** toolbar button. `PostEditor` has a "Writing
  assistant" sidebar card.
- `Field` selects accept `placeholderOption={false}`.

Checks:
- 12 unit tests of the Gemini client against mocked responses: header
  auth, JSON parsing, 429/400/404, blocked prompt, MAX_TOKENS, network
  failure, older models without a thinking level, missing key.
- Route: GET and POST without a session return 401, cross-origin returns
  403 and DELETE returns 405. Lint and build pass. No Gemini code or prompts
  in the client bundle.
- UI was checked in the dev preview at 1440px and 375px.

Not tested: a live Gemini call. That needs the client's `GEMINI_API_KEY`
and a signed-in staff account.

### Custom blog categories (24 Nov 2026)

Staff can add categories from the post editor's Category box ("Add new
category", as in WordPress). The new category is saved and selected
straight away. Typing an existing name just selects that category.
- `POST /api/admin/categories/` is staff only and checks origin. It
  validates with `validateCategory`: 2–60 characters, slug generated from
  the name, accents and "&" handled. It runs as the signed-in user, so the
  existing RLS policy "Staff manage categories" applies, and a duplicate
  slug returns 409.
- `createCategory` (services/posts.js) adds the category at the end of the
  list (`sort_order`).
- No migration was needed: the table, policies and grants already allowed
  staff to insert.
- The public blog only lists categories that have at least one published
  post, so empty new categories don't appear there.
- The Publish card in the editor sidebar is no longer sticky, because it
  slid over the cards beneath it while scrolling.

Follow-up (same day): **Categories page** at `/admin/categories/`, linked
in the admin navigation.
- Add a category with an optional description.
- Rename it or change the description inline. The slug stays fixed, so
  existing `?category=` links keep working.
- Reorder with up/down buttons. The change shows straight away, is saved
  with `PUT /api/admin/categories/` and is reverted if the save fails. The
  order sets the blog's filter order.
- Delete. The confirmation says how many posts will become
  "Uncategorised"; the foreign key sets their category to null.
- Each row shows its post count and links to the blog filter.
- APIs: `PUT /api/admin/categories/` (order),
  `PATCH|DELETE /api/admin/categories/[id]/`. They are staff only, check
  origin, validate ids and run as the user under RLS. Blog, home and
  affected post pages are revalidated after each change.
- `categories.js` moved to `categories/index.js`.
- Dev preview: `/dev/admin-preview/?view=categories`.
- Checked: guards return 401/403 and the page redirects to sign-in without a
  session. Reorder rollback, the rename form and the delete warning were
  tested in the preview, at 1440px and 375px. Lint and build pass.

### Team, invitations and full settings (24 Nov 2026)

Client asked for "full settings and team invite pages, professional and
world standard". They chose all four settings sections, and email invites
with a copy-link fallback.

Database: `supabase/migrations/0004_team_and_settings.sql`
- `staff_profiles` gains email, job title and invite columns (invited_by,
  invited_at, accepted_at).
- Staff can update their own name and title (column grants); a trigger
  blocks role changes by non-admins.
- New `settings` table (business, blog, enquiries) with RLS: business is
  public read, the rest staff read, admins write.
- **The client must run this migration.**

Team (`/admin/team/`, `TeamManager`, `services/team.js`, `/api/admin/team`):
- Filter tabs, member rows with avatar, role, status (Active, Invited or
  Invite expired) and last active.
- Admins can change roles inline, copy a link, resend or remove.
- Invite dialog: role cards, email or link, a success state with copy and
  WhatsApp share.
- Permissions table showing what each role can do.
- Safeguards: no self-removal, at least one admin, 20 invites per hour.

Auth flows:
- `/admin/set-password/` handles invites and resets: `token_hash` and
  `code` on the server, the URL fragment in the browser. It strips tokens,
  sends `no-referrer` and shows expired and revoked states.
- `/admin/forgot-password/` gives the same reply whether or not the account
  exists. Login links to it.
- `PasswordFields` has a strength meter, a live rules list and a show/hide
  toggle.

Settings (`/admin/settings/?section=…`, `components/admin/settings/*`):
- Left navigation (a strip on phones). Each section is a card with a sticky
  "unsaved changes" bar (Discard / Save) and a warning before leaving.
- Profile; Security (change password with the current one, sign out of
  other devices or everywhere, account details).
- Business details: phone list, WhatsApp, hours, address, six social
  networks, live preview on wide screens.
- Blog: default author and category, articles per page, AI on/off.
- Enquiries: required phone, auto-close, retention.

The site now uses these settings:
- Every public page gets `business` through `withSiteSettings` and the
  `useBusiness()` context. Header, footer, mobile menu, contact page, hero,
  CTA, apply page, 500 page, legal text and JSON-LD all read from it.
  `formatAddress`, `mapsUrl` and `socialLinks` moved from config/site.js to
  utils/settings.js.
- Saving business details revalidates every public page.
- Contact form: phone required when set, checked in the browser and the API.
- Blog "Show more" paging; new posts pre-fill the default author and
  category.
- The AI assistant API returns 403 when it is off, and the UI hides it.
- Enquiry housekeeping runs on dashboard and enquiries loads.

Checks:
- Lint and build pass. The production crawl found 14 pages, all 200,
  with valid JSON-LD.
- Guards: team, settings and profile APIs return 401 without a session and
  403 cross-origin; pages redirect to sign-in; a bad token shows the
  expired page.
- UI checked in dev previews (`?view=team`, `?view=settings&section=…`) at
  1440px and 375px. Fixed the save bar not sticking, the permissions table
  overflowing on phones and the phone label width.

Not yet tested: anything against the real database. That needs migration
0004, then a real invite (copy-link path, no email), accepting it, role
change and removal, and saving each settings section.

#### Live test against Supabase (24 Nov 2026, after migration 0004)

The test used a temporary admin and two invitees (`@example.com`). No
emails were sent. Everything was deleted afterwards, and settings were
reset to defaults.

Team and access:
- Invite with a copied link → set-password (token verified on the server,
  URL cleaned) → joined as editor → status "Active".
- Editor limits:
  - The APIs return 403 and the admin controls are hidden.
  - Directly in the database, an editor can't change their own role
    ("permission denied"), can't edit others (0 rows) and can't write
    settings (0 rows).
- Role change editor ↔ admin works.
- Self-removal is blocked (409). A duplicate invite, even with different
  capitalisation, is blocked (409).
- A new copied link stops the earlier link working ("This link has
  expired"). Removing a member deletes their login.

Settings:
- Business details: saving updated every public page immediately on the
  production build. On `next dev`, dynamic routes fail to revalidate
  ("Cannot find module for page"), but they render fresh on request there
  anyway.
- Blog:
  - The default category is pre-selected on new posts.
  - Turning the AI assistant off hides it (editor and dashboard) and makes
    its API return 403.
  - Articles per page reaches the blog.
- Enquiries: required phone reaches the contact page and the API rejects
  a missing phone. Housekeeping on dashboard load closed a 40-day-old
  "contacted" enquiry, deleted a 400-day-old closed one and left a recent
  one alone.

Security:
- Changing the password checks the current one; the old password then
  fails and the new one works.
- "Sign out of other devices" revoked a second session and kept this one.
- A recovery link opens "Choose a new password", and the new password
  works.

Bugs found and fixed:
- Submitting an auth form before the page finished loading did a plain GET
  submit, putting field values in the URL (on the login page that would
  include the password). Auth forms now use `method="post"` and keep the
  submit button disabled until loaded (`useHydrated`). Every other admin
  form also uses POST.
- Expired or used tokens now redirect to `?expired=1`, so the token
  doesn't stay in the address bar.

### Designed confirmation dialogs (24 Nov 2026)

`window.confirm()` is replaced everywhere in the admin by `ConfirmDialog`.
`ConfirmProvider` in AdminLayout supplies it, and pages call
`await confirm({...})` through `useConfirm()`.
- It is a `<dialog role="alertdialog">` with a tone icon (danger: red bin;
  warning: amber; default: green), a title, a message and an optional
  "what will happen" list.
- Dangerous dialogs focus Cancel first. Escape and the backdrop cancel.
  On phones the buttons stack full width with the main action on top.
- Used for:
  - deleting a post ("Move to bin" is now "Delete post", because it always
    deleted permanently);
  - deleting a category (says how many posts become Uncategorised);
  - removing a member or cancelling an invitation;
  - signing out of other devices or everywhere.
- Also fixed: the "Copy link" and "Resend" labels on the Team page no
  longer wrap.

### Admin restyle: "sunlit architectural" (24 Nov 2026)

The client supplied a style reference and asked to keep the admin's
colours, so the design language changed but the palette did not.
- **Type:** Plus Jakarta Sans for the admin only (`lib/adminFont.js`,
  loaded by AdminLayout and AuthLayout; the public site doesn't download
  it).
  - Large, light, tightly tracked headings: page titles 300 weight,
    34–48px, −0.04em; light settings and callout titles.
  - Stat figures are light, 44px, with tabular numbers.
  - No heavy weights: 600 → 500 and 700 → 600 across admin CSS, including
    `font-semibold` and `font-bold` inside the admin.
- **Radius:** 12px for cards, buttons, inputs and lists; 18px for feature
  surfaces (sidebar, dialogs, callout, sign-in card); pills unchanged.
- **Elevation:** short soft shadows only (`0 0.5px 2px` / `0 2px 4px` /
  hover `0 2px 10px`). The large diffuse shadows were removed, and so were
  the stat cards' decorative circles and hover lift.
- **Inputs:** soft filled surface (`rgb(0 0 0 / 0.025)`), hairline border,
  12px radius, brand focus ring. Headline fields opt out with
  `data-headline`.
- **Spacing:** roomier page padding (up to 56px), 40px between page
  sections, larger card and settings-row padding.
- `ConfirmProvider` moved inside `.shell` so dialogs inherit the admin
  font and tokens.
- Checked on the dashboard, post editor, team, settings, invite dialog and
  sign-in at 1440px and 375px. Lint and build pass. The public site still
  uses Poppins and Inter.

### No local URLs in emails (24 Nov 2026)

- `emailBaseUrl()` (lib/http.js) is now the only source of the address used
  in email links. It reads `NEXT_PUBLIC_SITE_URL`, which must be a public
  **https** address. It returns null for localhost, loopback, private
  ranges, `.local`/`.localhost`/`.test`/`.internal`, plain http and invalid
  values, and when it is null no email is sent.
- **Invitations:**
  - The first email and resends use `emailBaseUrl`; copied links still use
    the current site.
  - In local mode the "send by email" option is disabled with an
    explanation, a link is offered instead, and "Resend" is hidden; the API
    refuses a resend too.
- **Password reset:** moved from the browser (`window.location.origin`) to
  `POST /api/auth/forgot-password`.
  - It checks origin, validates input and rate-limits per IP and per email.
  - It uses the implicit flow, so the link works on any device, and gives
    the same reply whether or not the account exists.
  - In local mode it returns 503 and the page shows a notice.
- Removed the `http://localhost:3000` fallback in config/site.js; it is now
  the public domain.
- Docs: the Supabase **Site URL** must be set to the live domain (its
  default is localhost:3000).
- Tests:
  - 15 address cases.
  - The reset API on a production build returns 503 for a local address,
    400 for a bad email and 403 cross-origin.
  - No hard-coded localhost remains in the source.
  - Lint and build pass.

### Gemini "billing" error explained (24 Nov 2026)

The client reported the assistant "asking for billing". A probe with the
configured key returned **HTTP 402 "Your prepayment credits are depleted"**
for every model, including the Flash-Lite ones. The cause is the key's
Google project, which is linked to a prepaid billing account at $0. Per
Google's docs such projects lose all access and aren't downgraded to the
free tier. The code's model (`gemini-3.6-flash`) is a free-tier model, so
no code change is needed for cost. Fix: unlink billing from the project, or
use a key from a project without billing, or add prepaid credit.
- `lib/gemini.js` now maps 402 and billing errors to a clear message
  instead of a generic failure (unit test added; 13 passing).
- DEPLOYMENT.md → Writing assistant → "Privacy and cost" rewritten with the
  free and paid options and the 402 fix.
