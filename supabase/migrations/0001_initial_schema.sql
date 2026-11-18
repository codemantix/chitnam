-- =====================================================================
-- Chitnam Penguins Links — initial schema
--
-- Run in the Supabase SQL editor (or `supabase db push`). Idempotent where
-- practical. Creates:
--   staff_profiles  who may use the admin area (linked to auth.users)
--   enquiries       student/contact enquiries (private, PII)
--   categories, authors, posts   blog content
--   rate_limits     fixed-window counters for the enquiry endpoint
--   storage bucket  blog-images (public read, staff write)
--
-- Security model
--   * RLS is enabled on every table.
--   * The public (anon) role can ONLY read published posts, categories and
--     authors. It cannot read or write enquiries at all.
--   * Enquiries are inserted by the Next.js API route using the service-role
--     key, after server-side validation and rate limiting.
--   * Staff (rows in staff_profiles) can manage posts and read/update
--     enquiries. Only admins can delete enquiries (privacy requests).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Staff
-- ---------------------------------------------------------------------
create table if not exists public.staff_profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null check (char_length(full_name) between 1 and 120),
  role        text not null default 'editor' check (role in ('editor', 'admin')),
  created_at  timestamptz not null default now()
);

alter table public.staff_profiles enable row level security;

-- Helper functions run with the definer's rights so policies can call them
-- without granting direct access to staff_profiles.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.staff_profiles where id = auth.uid());
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.staff_profiles where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "Staff can read staff profiles" on public.staff_profiles;
create policy "Staff can read staff profiles"
  on public.staff_profiles for select
  to authenticated
  using (public.is_staff());

-- ---------------------------------------------------------------------
-- Enquiries (private)
-- ---------------------------------------------------------------------
create table if not exists public.enquiries (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  source             text not null check (source in ('apply', 'contact')),
  full_name          text not null check (char_length(full_name) between 2 and 120),
  email              text not null check (char_length(email) between 3 and 254),
  phone              text check (phone is null or char_length(phone) <= 30),
  destination        text check (destination is null or char_length(destination) <= 40),
  study_level        text check (study_level is null or char_length(study_level) <= 40),
  field_of_interest  text check (field_of_interest is null or char_length(field_of_interest) <= 120),
  interest           text check (interest is null or char_length(interest) <= 40),
  message            text check (message is null or char_length(message) <= 2000),
  consent            boolean not null check (consent = true),
  consent_at         timestamptz not null default now(),
  status             text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  staff_notes        text check (staff_notes is null or char_length(staff_notes) <= 2000),
  ip_hash            text,
  user_agent         text check (user_agent is null or char_length(user_agent) <= 300)
);

create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);
create index if not exists enquiries_status_idx on public.enquiries (status);

alter table public.enquiries enable row level security;

-- No insert/select policies for anon: the table is invisible to the public.
drop policy if exists "Staff can read enquiries" on public.enquiries;
create policy "Staff can read enquiries"
  on public.enquiries for select
  to authenticated
  using (public.is_staff());

drop policy if exists "Staff can update enquiries" on public.enquiries;
create policy "Staff can update enquiries"
  on public.enquiries for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "Admins can delete enquiries" on public.enquiries;
create policy "Admins can delete enquiries"
  on public.enquiries for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- Blog: categories and authors
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name         text not null check (char_length(name) between 1 and 60),
  description  text check (description is null or char_length(description) <= 300),
  sort_order   int not null default 0
);

create table if not exists public.authors (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name         text not null check (char_length(name) between 1 and 120),
  role         text check (role is null or char_length(role) <= 120),
  bio          text check (bio is null or char_length(bio) <= 600),
  avatar_path  text
);

alter table public.categories enable row level security;
alter table public.authors enable row level security;

drop policy if exists "Anyone can read categories" on public.categories;
create policy "Anyone can read categories"
  on public.categories for select using (true);

drop policy if exists "Staff manage categories" on public.categories;
create policy "Staff manage categories"
  on public.categories for all
  to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Anyone can read authors" on public.authors;
create policy "Anyone can read authors"
  on public.authors for select using (true);

drop policy if exists "Staff manage authors" on public.authors;
create policy "Staff manage authors"
  on public.authors for all
  to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------------
-- Blog: posts
-- ---------------------------------------------------------------------
create table if not exists public.posts (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 100),
  title             text not null check (char_length(title) between 3 and 140),
  excerpt           text not null check (char_length(excerpt) between 20 and 300),
  body              text not null default '' check (char_length(body) <= 60000),
  cover_image_path  text,
  cover_image_alt   text check (cover_image_alt is null or char_length(cover_image_alt) <= 200),
  category_id       uuid references public.categories (id) on delete set null,
  author_id         uuid references public.authors (id) on delete set null,
  status            text not null default 'draft' check (status in ('draft', 'published')),
  published_at      timestamptz,
  seo_title         text check (seo_title is null or char_length(seo_title) <= 70),
  seo_description   text check (seo_description is null or char_length(seo_description) <= 170),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  search            tsvector generated always as (
                      setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
                      setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
                      setweight(to_tsvector('english', coalesce(body, '')), 'C')
                    ) stored,
  -- A published post must have a publication date.
  constraint published_needs_date check (status = 'draft' or published_at is not null)
);

create index if not exists posts_published_idx on public.posts (status, published_at desc);
create index if not exists posts_category_idx on public.posts (category_id);
create index if not exists posts_search_idx on public.posts using gin (search);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

-- The public sees only published posts whose date has arrived.
drop policy if exists "Anyone can read published posts" on public.posts;
create policy "Anyone can read published posts"
  on public.posts for select
  using (status = 'published' and published_at <= now());

drop policy if exists "Staff can read all posts" on public.posts;
create policy "Staff can read all posts"
  on public.posts for select
  to authenticated
  using (public.is_staff());

drop policy if exists "Staff can insert posts" on public.posts;
create policy "Staff can insert posts"
  on public.posts for insert
  to authenticated
  with check (public.is_staff());

drop policy if exists "Staff can update posts" on public.posts;
create policy "Staff can update posts"
  on public.posts for update
  to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff can delete posts" on public.posts;
create policy "Staff can delete posts"
  on public.posts for delete
  to authenticated
  using (public.is_staff());

-- ---------------------------------------------------------------------
-- Rate limiting (enquiry endpoint)
-- ---------------------------------------------------------------------
create table if not exists public.rate_limits (
  key           text not null,
  window_start  timestamptz not null,
  count         int not null default 0,
  primary key (key, window_start)
);

alter table public.rate_limits enable row level security;
-- No policies: only the function below (and the service role) touch it.

-- Returns true if the request is allowed, false if the limit is exceeded.
create or replace function public.hit_rate_limit(
  p_key text,
  p_limit int,
  p_window_seconds int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window timestamptz :=
    to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_count int;
begin
  insert into public.rate_limits (key, window_start, count)
  values (p_key, v_window, 1)
  on conflict (key, window_start)
  do update set count = public.rate_limits.count + 1
  returning count into v_count;

  -- Occasional clean-up of old windows.
  if random() < 0.05 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.hit_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, int, int) to service_role;

-- ---------------------------------------------------------------------
-- Storage: blog images
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images',
  'blog-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Staff can upload blog images" on storage.objects;
create policy "Staff can upload blog images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-images' and public.is_staff());

drop policy if exists "Staff can update blog images" on storage.objects;
create policy "Staff can update blog images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'blog-images' and public.is_staff());

drop policy if exists "Staff can delete blog images" on storage.objects;
create policy "Staff can delete blog images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-images' and public.is_staff());
