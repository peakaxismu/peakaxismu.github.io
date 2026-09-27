create table if not exists public.scheduled_hikes (
  id uuid primary key default gen_random_uuid(),
  hike_id uuid not null references public.hikes(id) on delete restrict,
  date date not null,
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

create index if not exists scheduled_hikes_hike_id_idx on public.scheduled_hikes(hike_id);
create index if not exists scheduled_hikes_date_idx on public.scheduled_hikes(date);
create index if not exists scheduled_hikes_status_date_idx on public.scheduled_hikes(status, date);

alter table public.scheduled_hikes enable row level security;

drop policy if exists "Public can read published scheduled hikes" on public.scheduled_hikes;
grant select on public.scheduled_hikes to anon, authenticated;

create policy "Public can read published scheduled hikes"
  on public.scheduled_hikes for select
  using (status = 'published');

alter table public.enquiries
  add column if not exists scheduled_hike_id uuid references public.scheduled_hikes(id) on delete set null;

create index if not exists enquiries_scheduled_hike_id_idx on public.enquiries(scheduled_hike_id);

insert into public.scheduled_hikes (
  id, hike_id, date, price, spots_total, spots_remaining, status,
  trail_condition_status, trail_condition_note, trail_condition_updated_at, created_at
)
select
  old.id,
  old.source_hike_id,
  old.date::date,
  old.price,
  old.spots_total,
  old.spots_remaining,
  old.status,
  coalesce(old.trail_condition_status, 'open'),
  old.trail_condition_note,
  old.trail_condition_updated_at,
  old.created_at
from public.hikes old
where old.booking_type = 'scheduled_group'
  and old.source_hike_id is not null
on conflict (id) do update set
  price = excluded.price,
  spots_total = excluded.spots_total,
  spots_remaining = excluded.spots_remaining,
  status = excluded.status,
  trail_condition_status = excluded.trail_condition_status,
  trail_condition_note = excluded.trail_condition_note,
  trail_condition_updated_at = excluded.trail_condition_updated_at;

update public.enquiries e
set scheduled_hike_id = sh.id
from public.scheduled_hikes sh
left join public.hikes legacy on legacy.id = sh.id
where e.interest_type = 'hike'
  and e.scheduled_hike_id is null
  and (
    e.reference_id = sh.id::text
    or e.reference_id = legacy.name
    or e.reference_id = concat((select h.name from public.hikes h where h.id = sh.hike_id), ' - ', sh.date::text)
  );

delete from public.hikes
where booking_type = 'scheduled_group'
  and source_hike_id is not null;

alter table public.hikes
  drop column if exists source_hike_id;