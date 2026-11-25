-- =====================================================================
-- 0004 — Team management and site settings
--
-- Run after 0001–0003 in the Supabase SQL editor. Safe to run more than once.
--
--   staff_profiles  + email, job title, invite tracking
--   settings        key/value JSON for business details, blog defaults
--                   and enquiry handling, editable from /admin/settings/
--
-- Team changes (invite, change role, remove) go through server API routes
-- that check the caller is an admin and then use the service-role key, so
-- no new write policies are needed on staff_profiles for normal users.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Staff profiles: extra columns
-- ---------------------------------------------------------------------
alter table public.staff_profiles
  add column if not exists email        text check (email is null or char_length(email) <= 254),
  add column if not exists job_title    text check (job_title is null or char_length(job_title) <= 80),
  add column if not exists invited_by   uuid references public.staff_profiles (id) on delete set null,
  add column if not exists invited_at   timestamptz,
  add column if not exists accepted_at  timestamptz;

-- Existing staff (created before invites existed) count as accepted.
update public.staff_profiles set accepted_at = created_at where accepted_at is null and invited_at is null;

-- Fill in emails for existing staff from auth.users.
update public.staff_profiles p
   set email = u.email
  from auth.users u
 where u.id = p.id and p.email is null;

-- Staff may update their own name and job title (role is protected below).
drop policy if exists "Staff update own profile" on public.staff_profiles;
create policy "Staff update own profile"
  on public.staff_profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Only admins may change roles or invite metadata. A trigger enforces it,
-- because RLS policies can't compare old and new column values.
create or replace function public.protect_staff_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- The service role (server API) is trusted; it has already checked admin rights.
  if coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'
     or current_user in ('postgres', 'service_role', 'supabase_admin') then
    return new;
  end if;
  if (new.role is distinct from old.role
      or new.invited_by is distinct from old.invited_by
      or new.invited_at is distinct from old.invited_at
      or new.email is distinct from old.email)
     and not public.is_admin() then
    raise exception 'Only administrators can change roles or invitation details.';
  end if;
  return new;
end;
$$;

drop trigger if exists staff_profiles_protect_role on public.staff_profiles;
create trigger staff_profiles_protect_role
  before update on public.staff_profiles
  for each row execute function public.protect_staff_role();

grant update (full_name, job_title, accepted_at) on public.staff_profiles to authenticated;

-- ---------------------------------------------------------------------
-- Settings (key/value)
-- ---------------------------------------------------------------------
create table if not exists public.settings (
  key         text primary key check (key in ('business', 'blog', 'enquiries')),
  value       jsonb not null default '{}'::jsonb check (jsonb_typeof(value) = 'object' and pg_column_size(value) < 20000),
  updated_at  timestamptz not null default now(),
  updated_by  uuid references public.staff_profiles (id) on delete set null
);

alter table public.settings enable row level security;

-- Business details are shown on the public website, so anyone may read them.
drop policy if exists "Anyone can read business settings" on public.settings;
create policy "Anyone can read business settings"
  on public.settings for select
  using (key = 'business');

drop policy if exists "Staff can read settings" on public.settings;
create policy "Staff can read settings"
  on public.settings for select
  to authenticated
  using (public.is_staff());

drop policy if exists "Admins manage settings" on public.settings;
create policy "Admins manage settings"
  on public.settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.settings to anon, authenticated;
grant insert, update on public.settings to authenticated;
grant all on public.settings to service_role;

insert into public.settings (key) values ('business'), ('blog'), ('enquiries')
on conflict (key) do nothing;
