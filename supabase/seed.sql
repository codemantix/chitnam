-- Starter blog categories (from the brief: admissions, studying abroad,
-- visa preparation, scholarships, pre-departure). Safe to run more than once.
insert into public.categories (slug, name, description, sort_order) values
  ('admissions', 'Admissions', 'Choosing courses and applying to universities abroad.', 1),
  ('studying-abroad', 'Studying abroad', 'What studying and living overseas is really like.', 2),
  ('student-visas', 'Student visas', 'Preparing a strong, accurate student visa application.', 3),
  ('scholarships', 'Scholarships', 'Funding options and how to apply for them.', 4),
  ('pre-departure', 'Pre-departure', 'Getting ready to travel and settle in.', 5)
on conflict (slug) do nothing;

-- A default byline so posts can be published before individual staff
-- authors are added. Edit or add authors in the Supabase table editor.
insert into public.authors (slug, name, role, bio) values
  (
    'chitnam-advisory-team',
    'Chitnam advisory team',
    'Study abroad advisers, Port Harcourt',
    'Articles from the advisers at Chitnam Penguins Links, an education placement agency in Port Harcourt founded in 2015.'
  )
on conflict (slug) do nothing;

-- To give someone admin access (after inviting them under
-- Authentication → Users in the Supabase dashboard):
--   insert into public.staff_profiles (id, full_name, role)
--   select id, 'Full Name', 'admin' from auth.users where email = 'person@example.com';
