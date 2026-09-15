begin;

select plan(3);

select has_table(
  'public',
  'enquiries',
  'enquiries table should exist'
);

select has_column(
  'public',
  'enquiries',
  'status',
  'enquiries should have a status column'
);

select results_eq(
  $$
    select pg_get_constraintdef(oid)
    from pg_constraint
    where conrelid = 'public.enquiries'::regclass
      and conname = 'enquiries_status_check'
  $$,
  $$
    values ('CHECK ((status = ANY (ARRAY[''new''::text, ''contacted''::text, ''quoted''::text, ''confirmed''::text, ''completed''::text, ''closed''::text])))')
  $$,
  'enquiries status constraint should contain the complete lifecycle'
);

select * from finish();
rollback;
