-- =====================================================================
-- Table privileges for the Supabase API roles.
--
-- Newer Supabase projects don't automatically expose tables created in SQL
-- to the Data API roles (anon, authenticated, service_role). Without these
-- grants every request fails with "permission denied for table" (42501).
--
-- Grants say WHICH operations a role may attempt; Row Level Security
-- (0001_initial_schema.sql) still decides WHICH ROWS. Least privilege:
--   anon           read blog content only — nothing else
--   authenticated  read blog content; staff policies allow edits; enquiries
--                  only via the staff RLS policies
--   service_role   used only by the server (enquiry inserts, rate limiting)
-- Safe to run more than once.
-- =====================================================================

grant usage on schema public to anon, authenticated, service_role;

-- Blog content: public read (RLS limits posts to published ones).
grant select on public.categories, public.authors, public.posts to anon, authenticated;
grant insert, update, delete on public.categories, public.authors, public.posts to authenticated;

-- Enquiries: never to anon. Staff access is further limited by RLS.
revoke all on public.enquiries from anon;
grant select, update, delete on public.enquiries to authenticated;

-- Staff profiles: readable by signed-in users, rows limited by RLS.
revoke all on public.staff_profiles from anon;
grant select on public.staff_profiles to authenticated;

-- Rate limits: server only.
revoke all on public.rate_limits from anon, authenticated;

-- The server (service role) needs full access to these tables.
grant all on public.staff_profiles, public.enquiries, public.categories,
  public.authors, public.posts, public.rate_limits to service_role;

-- Helper functions used inside RLS policies.
grant execute on function public.is_staff() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
