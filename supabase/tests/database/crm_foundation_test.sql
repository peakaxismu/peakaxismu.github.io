begin;

select plan(24);

select has_table('public', 'customers', 'customers table exists');
select has_table('public', 'bookings', 'bookings table exists');
select has_table('public', 'crm_tasks', 'CRM tasks table exists');
select has_table('public', 'crm_ai_suggestions', 'AI suggestions review queue exists');
select has_column('public', 'enquiries', 'customer_id', 'existing enquiries link to canonical customers');
select has_column('public', 'bookings', 'scheduled_hike_id', 'bookings can link to scheduled hikes');
select has_index('public', 'bookings', 'bookings_date_status_idx', 'bookings have a date/status index');
select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = 'public.bookings'::regclass
      and conname = 'bookings_hike_type_check'
      and contype = 'c'
  ),
  'scheduled hike bookings require a scheduled departure'
);
select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = 'public.bookings'::regclass
      and conname = 'bookings_expedition_type_check'
      and contype = 'c'
  ),
  'expedition bookings require an expedition record'
);
select has_trigger('public', 'bookings', 'bookings_sync_capacity', 'confirmed bookings reserve scheduled-hike capacity');
select ok((select relrowsecurity from pg_class where oid = 'public.customers'::regclass), 'customer rows have RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.bookings'::regclass), 'booking rows have RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.crm_tasks'::regclass), 'task rows have RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.crm_ai_suggestions'::regclass), 'AI suggestions have RLS enabled');
select ok(not has_table_privilege('anon', 'public.customers', 'SELECT'), 'anonymous users cannot read customer records');
select ok(not has_table_privilege('authenticated', 'public.customers', 'SELECT'), 'authenticated non-admins cannot read customer records directly');
select ok(not has_table_privilege('anon', 'public.bookings', 'SELECT'), 'anonymous users cannot read bookings');
select ok(not has_table_privilege('anon', 'public.crm_ai_suggestions', 'SELECT'), 'anonymous users cannot read internal AI suggestions');

-- Exercise the real capacity trigger, not only the trigger's presence.
insert into public.customers (id, full_name, email)
values ('91000000-0000-4000-8000-000000000001', 'CRM Capacity Test', 'crm-capacity-test@example.invalid');

insert into public.hikes (id, name, difficulty, duration, location, price, status)
values ('92000000-0000-4000-8000-000000000001', 'CRM Capacity Test Hike', 'moderate', '1 day', 'Test location', 'MUR 100', 'published');

insert into public.scheduled_hikes (id, hike_id, date, price, spots_total, spots_remaining, status)
values ('93000000-0000-4000-8000-000000000001', '92000000-0000-4000-8000-000000000001', current_date + 30, 'MUR 100', 5, 5, 'published');

insert into public.bookings (id, customer_id, activity_type, scheduled_hike_id, booking_date, group_size, status)
values ('94000000-0000-4000-8000-000000000001', '91000000-0000-4000-8000-000000000001', 'hike', '93000000-0000-4000-8000-000000000001', current_date + 30, 2, 'confirmed');

select is(
  (select spots_remaining from public.scheduled_hikes where id = '93000000-0000-4000-8000-000000000001'),
  3,
  'confirmed booking reserves its group size'
);

update public.bookings set group_size = 4 where id = '94000000-0000-4000-8000-000000000001';

select is(
  (select spots_remaining from public.scheduled_hikes where id = '93000000-0000-4000-8000-000000000001'),
  1,
  'increasing a confirmed group reserves only the additional spaces'
);

select throws_ok(
  $$ update public.bookings set group_size = 6 where id = '94000000-0000-4000-8000-000000000001' $$,
  '23514',
  'Not enough available spaces for this booking',
  'capacity guard rejects a group increase that would overbook'
);

select is(
  (select group_size from public.bookings where id = '94000000-0000-4000-8000-000000000001'),
  4,
  'failed over-capacity update leaves the booking unchanged'
);

select is(
  (select spots_remaining from public.scheduled_hikes where id = '93000000-0000-4000-8000-000000000001'),
  1,
  'failed over-capacity update does not consume spaces'
);

update public.bookings set status = 'cancelled' where id = '94000000-0000-4000-8000-000000000001';

select is(
  (select spots_remaining from public.scheduled_hikes where id = '93000000-0000-4000-8000-000000000001'),
  5,
  'cancelling a confirmed booking releases its reserved spaces'
);

select * from finish();
rollback;
