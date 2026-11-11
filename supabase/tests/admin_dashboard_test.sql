-- Tests for the admin dashboard's extra read access.
-- Run with: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(3);

insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'admin@test.local', '{"display_name": "Admin"}'),
  ('00000000-0000-0000-0000-00000000000b', 'ali@test.local', '{"display_name": "Ali"}'),
  ('00000000-0000-0000-0000-00000000000c', 'siti@test.local', '{"display_name": "Siti"}');
update public.profiles set role = 'admin'
  where id = '00000000-0000-0000-0000-00000000000a';

insert into public.organisers (id, slug, name, verification) values
  ('00000000-0000-0000-0000-00000000000b', 'ali-fishing', 'Ali Fishing Club', 'verified'),
  ('00000000-0000-0000-0000-00000000000c', 'siti-pond', 'Siti Pond', 'verified');

insert into public.events (id, slug, organiser_id, category_id, title, description, starts_at, state, district, venue)
select v.id, v.slug, v.organiser, c.id,
       'Jom Pancing 2026', 'Shore fishing tournament.',
       now() + interval '7 days', 'Terengganu', 'Kuala Nerus', 'Pantai Batu Burok'
from public.categories c,
     (values ('00000000-0000-0000-0000-0000000000e1'::uuid, 'jom-pancing', '00000000-0000-0000-0000-00000000000b'::uuid),
             ('00000000-0000-0000-0000-0000000000e2'::uuid, 'jom-pancing-2', '00000000-0000-0000-0000-00000000000c'::uuid)) v (id, slug, organiser)
where c.slug = 'competition';

insert into public.payments (user_id, event_id, purpose, amount_myr, stripe_session_id, status, paid_at) values
  ('00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-0000000000e1', 'listing', 10, 'cs_admin_1', 'paid', now()),
  ('00000000-0000-0000-0000-00000000000c', '00000000-0000-0000-0000-0000000000e2', 'listing', 10, 'cs_admin_2', 'paid', now());

set local role authenticated;

set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-00000000000a", "role": "authenticated"}';
select is((select count(*)::int from public.payments), 2,
  'an admin reads every payment');

set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-00000000000b", "role": "authenticated"}';
select is((select count(*)::int from public.payments), 1,
  'an organiser still reads only their own payment');

set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-00000000000c", "role": "authenticated"}';
select is(
  (select count(*)::int from public.payments
    where user_id = '00000000-0000-0000-0000-00000000000b'), 0,
  'one organiser cannot read another organiser''s payment');

select * from finish();
rollback;
