-- Keep database defaults aligned with the admin publishing workflow.
alter table public.waterfalls
  alter column status set default 'draft';
