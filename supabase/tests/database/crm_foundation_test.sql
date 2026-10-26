begin;

select plan(18);

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

select * from finish();
rollback;
