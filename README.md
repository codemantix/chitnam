# Chitnam Penguins Links — website

The rebuilt website for Chitnam Penguins Links Limited, a study abroad consultancy
in Port Harcourt, Nigeria.

- **Framework:** Next.js 16, **Pages Router**, JavaScript/JSX only
- **Styling:** Tailwind CSS 4 + CSS Modules, sharing one set of design tokens
- **Data:** Supabase (database, auth, storage), added in Phase 4

See [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md) for the content audit, redirect
map, Supabase schema, phases and the list of facts awaiting client confirmation.

## Getting started

Requirements: Node.js 20.9 or newer, npm.

```bash
npm install
cp .env.example .env.local   # then fill in values
npm run dev
```

Open http://localhost:3000. The design-system reference page is at
http://localhost:3000/dev/foundation/ in development.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (Next.js core-web-vitals rules) |

## Environment variables

All variables are documented in [.env.example](.env.example). The important rules:

- `NEXT_PUBLIC_SITE_ENV=production` must be set **only** on the live domain.
  Everywhere else, every page is `noindex`.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never prefix it with `NEXT_PUBLIC_`.

## Project structure

```
src/
├── pages/            Routes only. Pages compose components and fetch data
│   ├── _app.js       Global CSS, fonts, per-page layout hook
│   ├── _document.js  <html lang>, icons
│   ├── 404.js
│   ├── dev/          Dev-only reference pages (404 in production)
│   ├── admin/        Staff dashboard: posts, enquiries (server-side auth)
│   └── api/          enquiries (public form), admin/* (staff only)
├── components/
│   ├── ui/           Small reusable building blocks (Button, Container, SEO…)
│   ├── layout/       Header, Navbar, Footer, PageLayout (Phase 2)
│   ├── home/         One folder per homepage section (Phase 2)
│   └── services/ blog/ forms/ admin/
├── styles/
│   ├── variables.css Design tokens (single source of truth)
│   ├── globals.css   Tailwind import, token → utility mapping, base styles
│   └── pages/        Page-level CSS Modules
├── config/site.js    Business details, contact info, indexing switch
├── constants/        Routes and navigation
├── data/             Static, versioned content (services, home, about, legal…)
├── utils/            Pure helpers (cn, seo, schema, validation, markdown, date)
├── hooks/            Reusable React hooks
├── lib/              Server helpers (http, rate limit, revalidate, uploads)
│   └── supabase/     browser, server (cookie session), public and admin clients
└── services/         Server-side data access (posts, enquiries, auth)
supabase/
├── migrations/       Schema, Row Level Security, storage, API grants (run in order)
└── seed.sql          Blog categories and a default author
```

Every significant component is a folder holding the component and its module:

```
components/ui/Button/
├── Button.jsx
└── Button.module.css
```

## Styling conventions

Tokens live in `src/styles/variables.css` as CSS custom properties.
`globals.css` maps them into Tailwind with `@theme inline`, so both layers use
the same values:

```jsx
// Tailwind utility generated from the token
<p className="text-brand-700">…</p>
```

```css
/* CSS Module using the token directly */
.eyebrow { color: var(--brand-700); }
```

- **Tailwind:** layout, grids, flex, spacing, responsive changes, simple text and colour.
- **CSS Modules:** custom compositions, pseudo-elements, transitions and animations,
  anything that would turn into a long, hard-to-read class string.
- Don't set the same property in both places.
- `prefers-reduced-motion` is respected globally and through the duration tokens.
- Brand green `#17B156` is for marks and rules only. Use `brand-700` for text and buttons
  (it meets WCAG AA contrast).

## SEO conventions

Every page renders `<SEO />` once:

```jsx
<SEO
  title="Student visa guidance"
  description="…unique, specific summary…"
  path="/our-services/student-visa-guidance/"
  jsonLd={[breadcrumbSchema(items)]}
/>
```

URLs keep a trailing slash (`trailingSlash: true`) to match the old WordPress
URLs. Retired URLs are redirected with 301s in `next.config.js`.

- Titles: `buildTitle()` appends "| Chitnam Penguins Links", falls back to
  "| Chitnam" when that would pass 60 characters, and drops the brand on very
  long titles.
- `/sitemap.xml` (`src/pages/sitemap.xml.js`, entries in `src/lib/sitemap.js`)
  is built per request from the data files and published posts, cached for an
  hour. A page that is `noindex` must not be listed there. Add new pages to
  `getSitemapEntries()`.
- `/robots.txt` allows crawling only when `NEXT_PUBLIC_SITE_ENV=production`.
- Default social image: `public/images/og-default.jpg` (1200×630).

## Supabase setup

1. Create a Supabase project. Copy the project URL, anon key and service-role
   key into `.env.local` (and later into the hosting provider).
2. In **SQL Editor**, run these files in order:
   1. `supabase/migrations/0001_initial_schema.sql` — tables, Row Level Security, storage bucket
   2. `supabase/migrations/0002_api_grants.sql` — table privileges for the API roles
      (needed on newer projects; harmless on older ones)
   3. `supabase/migrations/0003_rich_text_body.sql` — HTML post bodies and the
      media-library permission
   4. `supabase/seed.sql` — blog categories and a default author
3. **Authentication → Providers → Email:** turn off "Allow new users to sign up".
   Staff accounts are created by an administrator only.
4. **Authentication → Users → Add user:** create each staff account (email + password,
   auto-confirm). Then give them access in SQL Editor:
   ```sql
   insert into public.staff_profiles (id, full_name, role)
   select id, 'Full Name', 'admin' from auth.users where email = 'person@example.com';
   ```
   Use `'editor'` for staff who should manage posts and enquiries but not delete enquiries.
5. Sign in at `/admin/login/`.

### How data is protected

| Data | Public (anon key) | Staff (signed in + `staff_profiles` row) | Server (service role) |
| --- | --- | --- | --- |
| Published posts, categories, authors | Read | Read and write | — |
| Draft / scheduled posts | No access | Read and write | — |
| Enquiries | **No access** | Read, update status/notes (admins can delete) | Insert, after validation |
| Staff profiles | No access | Read | — |
| Rate-limit counters | No access | No access | Read/write via function |
| Blog images (storage) | Read | Upload, replace, delete | — |

Enquiry submissions go through `POST /api/enquiries/`: same-origin check, honeypot
field, minimum fill time, server-side validation, 5 per 10 minutes per hashed IP,
then insert with the service-role key. The form never accepts documents.

## Managing the blog

Staff sign in at `/admin/`. Posts are written in a rich-text editor modelled on
the WordPress Classic editor: paragraph styles, bold/italic/underline, lists,
quotes, alignment, links, a second "kitchen sink" toolbar row, Visual/Text (HTML)
tabs, distraction-free mode, word count, and an **Add Media** library for
uploading or reusing images (alt text required). Posts have a featured image,
category, author, excerpt and search-engine fields. HTML is cleaned with
`sanitize-html` when saved and again when rendered (`src/lib/sanitizeHtml.js`), so
scripts, embeds and unsafe links can never reach readers. Drafts are private; a
future publication date schedules a post.

To preview the editor in development without signing in, open
`/dev/admin-preview/` (sample data, 404 in production).

Publishing, updating, unpublishing or deleting a post rebuilds
the affected public pages (blog index, article, homepage) immediately.

## Deployment

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for hosting, environment
variables, Supabase settings, the DNS cutover (without breaking email),
pre-launch and post-launch checklists, and the security headers.

## Status

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Foundation: Pages Router, Tailwind + CSS Modules, tokens, shared UI components | Done |
| 2 | Header, navigation, footer, homepage sections | Done (see docs/PROJECT_PLAN.md → Phase log) |
| 3 | About, Services, Destinations, Partners, Contact, legal pages | Done (see docs/PROJECT_PLAN.md → Phase log) |
| 4 | Supabase, forms, blog, admin dashboard | Done (see docs/PROJECT_PLAN.md → Phase log) |
| 5 | SEO completion, QA, performance, security, deployment | Done; launch steps in docs/DEPLOYMENT.md |
