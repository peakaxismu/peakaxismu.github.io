create table if not exists public.scheduled_hikes (
  id uuid primary key default gen_random_uuid(),
  hike_id uuid not null references public.hikes(id) on delete cascade,
  date text not null,
  price text not null,
  spots_total integer not null default 10 check (spots_total > 0),
  spots_remaining integer not null default 10 check (spots_remaining >= 0 and spots_remaining <= spots_total),
  status text not null default 'draft' check (status in ('draft','published','retired')),
  trail_condition_status text not null default 'open' check (trail_condition_status in ('open','conditions_to_confirm','temporarily_unsuitable','closed')),
  trail_condition_note text,
  trail_condition_updated_at timestamptz,
  created_at timestamptz not null default now(),
  constraint scheduled_hikes_hike_date_unique unique (hike_id, date)
);

create index if not exists scheduled_hikes_hike_id_idx
  on public.scheduled_hikes(hike_id);

create index if not exists scheduled_hikes_date_idx
  on public.scheduled_hikes(date);

alter table public.scheduled_hikes enable row level security;

create policy "Public can read published scheduled hikes"
  on public.scheduled_hikes
  for select
  using (status = 'published');

alter table public.enquiries
  add column if not exists scheduled_hike_id uuid references public.scheduled_hikes(id) on delete set null;

create index if not exists enquiries_scheduled_hike_id_idx
  on public.enquiries(scheduled_hike_id);

insert into public.scheduled_hikes (
  id, hike_id, date, price, spots_total, spots_remaining, status,
  trail_condition_status, trail_condition_note, trail_condition_updated_at, created_at
)
select
  old.id,
  old.source_hike_id,
  old.date,
  old.price,
  old.spots_total,
  old.spots_remaining,
  old.status,
  old.trail_condition_status,
  old.trail_condition_note,
  old.trail_condition_updated_at,
  old.created_at
from public.hikes old
where old.booking_type = 'scheduled_group'
  and old.source_hike_id is not null
on conflict (id) do nothing;

update public.enquiries e
set scheduled_hike_id = e.reference_id::uuid
where e.interest_type = 'hike'
  and e.scheduled_hike_id is null
  and e.reference_id is not null
  and e.reference_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and exists (
    select 1 from public.scheduled_hikes sh
    where sh.id = e.reference_id::uuid
  );
