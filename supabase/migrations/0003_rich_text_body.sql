-- =====================================================================
-- Post bodies are now sanitised HTML from the rich-text editor
-- (previously Markdown). HTML is longer than Markdown, so the size limit
-- is raised, and search indexing strips tags so markup isn't searchable.
-- Safe to run more than once.
-- =====================================================================

alter table public.posts drop constraint if exists posts_body_check;
alter table public.posts drop constraint if exists posts_body_length;
alter table public.posts add constraint posts_body_length check (char_length(body) <= 200000);

drop index if exists public.posts_search_idx;
alter table public.posts drop column if exists search;
alter table public.posts add column search tsvector generated always as (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
  setweight(to_tsvector('english', regexp_replace(coalesce(body, ''), '<[^>]+>', ' ', 'g')), 'C')
) stored;
create index if not exists posts_search_idx on public.posts using gin (search);

comment on column public.posts.body is 'Sanitised HTML from the admin rich-text editor.';

-- ---------------------------------------------------------------------
-- Media library: staff can list uploaded images (the editor's
-- "Add Media" library). Public visitors still only get files by URL.
-- ---------------------------------------------------------------------
drop policy if exists "Staff can list blog images" on storage.objects;
create policy "Staff can list blog images"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'blog-images' and public.is_staff());
