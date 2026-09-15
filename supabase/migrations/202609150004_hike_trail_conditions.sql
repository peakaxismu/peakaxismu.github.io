alter table public.hikes
  add column if not exists trail_condition_status text not null default 'open',
  add column if not exists trail_condition_note text,
  add column if not exists trail_condition_updated_at timestamptz;

alter table public.hikes
  drop constraint if exists hikes_trail_condition_status_check;

alter table public.hikes
  add constraint hikes_trail_condition_status_check
  check (trail_condition_status in ('open', 'conditions_to_confirm', 'temporarily_unsuitable', 'closed'));

update public.hikes
set trail_condition_status = 'open'
where trail_condition_status is null;
