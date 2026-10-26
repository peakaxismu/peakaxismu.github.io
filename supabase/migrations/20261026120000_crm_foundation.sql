-- Peak Axis CRM foundation: customer records, bookings, tasks and AI review groundwork.
-- Customer deduplication is by normalized email; enquiry rows remain intact.

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(trim(full_name)) > 0),
  email text not null unique check (email = lower(trim(email)) and length(email) > 0),
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Preserve existing enquiries and create one initial customer per normalized email.
insert into public.customers (full_name, email, phone, created_at, updated_at)
select distinct on (lower(trim(e.email)))
  coalesce(nullif(trim(e.name), ''), lower(trim(e.email))),
  lower(trim(e.email)),
  nullif(trim(e.phone), ''),
  min(e.submitted_at) over (partition by lower(trim(e.email))),
  now()
from public.enquiries e
where nullif(trim(e.email), '') is not null
order by lower(trim(e.email)), e.submitted_at asc
on conflict (email) do nothing;

alter table public.enquiries
  add column if not exists customer_id uuid references public.customers(id) on delete set null;

create index if not exists enquiries_customer_id_idx
  on public.enquiries (customer_id);

update public.enquiries e
set customer_id = c.id
from public.customers c
where e.customer_id is null
  and lower(trim(e.email)) = c.email;

create or replace function public.set_customer_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_customer_updated_at();

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_reference text not null unique default ('PA-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  customer_id uuid not null references public.customers(id) on delete restrict,
  enquiry_id uuid references public.enquiries(id) on delete set null,
  activity_type text not null check (activity_type in ('hike', 'private_hike', 'expedition', 'team', 'activity')),
  scheduled_hike_id uuid references public.scheduled_hikes(id) on delete restrict,
  expedition_id uuid references public.expeditions(id) on delete restrict,
  booking_date date not null,
  group_size integer not null default 1 check (group_size > 0),
  total_amount numeric(12,2) check (total_amount is null or total_amount >= 0),
  currency char(3) not null default 'MUR' check (currency ~ '^[A-Z]{3}$'),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'partially_paid', 'paid', 'refunded')),
  internal_notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_hike_type_check check ((activity_type = 'hike' and scheduled_hike_id is not null) or (activity_type <> 'hike' and scheduled_hike_id is null)),
  constraint bookings_expedition_type_check check ((activity_type = 'expedition' and expedition_id is not null) or (activity_type <> 'expedition' and expedition_id is null)),
  constraint bookings_not_two_departures_check check (scheduled_hike_id is null or expedition_id is null)
);

create index if not exists bookings_customer_id_idx on public.bookings (customer_id);
create index if not exists bookings_enquiry_id_idx on public.bookings (enquiry_id);
create index if not exists bookings_date_status_idx on public.bookings (booking_date, status);
create index if not exists bookings_scheduled_hike_id_idx on public.bookings (scheduled_hike_id);

create or replace function public.set_booking_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row execute function public.set_booking_updated_at();

-- Confirmed group-hike bookings reserve real spaces in a row-locked update.
-- A failed capacity check aborts the booking write rather than overbooking.
create or replace function public.sync_booking_capacity()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  old_active boolean := false;
  new_active boolean := false;
  old_hike_id uuid;
  old_group_size integer;
  delta integer;
begin
  if tg_op <> 'INSERT' then
    old_active := old.status in ('confirmed', 'completed') and old.scheduled_hike_id is not null;
    old_hike_id := old.scheduled_hike_id;
    old_group_size := old.group_size;
  end if;

  if tg_op = 'DELETE' then
    if old_active then
      update public.scheduled_hikes
      set spots_remaining = least(spots_total, spots_remaining + old_group_size)
      where id = old_hike_id;
    end if;
    return old;
  end if;

  new_active := new.status in ('confirmed', 'completed') and new.scheduled_hike_id is not null;

  if old_active and new_active and old_hike_id = new.scheduled_hike_id then
    delta := new.group_size - old_group_size;
    if delta > 0 then
      update public.scheduled_hikes
      set spots_remaining = spots_remaining - delta
      where id = new.scheduled_hike_id
        and status = 'published'
        and spots_remaining >= delta;
      if not found then
        raise exception 'Not enough available spaces for this booking'
          using errcode = 'check_violation';
      end if;
    elsif delta < 0 then
      update public.scheduled_hikes
      set spots_remaining = least(spots_total, spots_remaining + (-delta))
      where id = new.scheduled_hike_id;
    end if;
    return new;
  end if;

  if old_active then
    update public.scheduled_hikes
    set spots_remaining = least(spots_total, spots_remaining + old_group_size)
    where id = old_hike_id;
  end if;

  if new_active then
    update public.scheduled_hikes
    set spots_remaining = spots_remaining - new.group_size
    where id = new.scheduled_hike_id
      and status = 'published'
      and spots_remaining >= new.group_size;
    if not found then
      raise exception 'Not enough available spaces for this booking or departure is not published'
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_sync_capacity on public.bookings;
create trigger bookings_sync_capacity
before insert or update or delete on public.bookings
for each row execute function public.sync_booking_capacity();

create table if not exists public.crm_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  description text,
  customer_id uuid references public.customers(id) on delete cascade,
  enquiry_id uuid references public.enquiries(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  due_at timestamptz,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  source text not null default 'manual' check (source in ('manual', 'ai', 'system')),
  created_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crm_tasks_link_check check (num_nonnulls(customer_id, enquiry_id, booking_id) >= 1)
);

create index if not exists crm_tasks_status_due_at_idx on public.crm_tasks (status, due_at);
create index if not exists crm_tasks_customer_id_idx on public.crm_tasks (customer_id);

create or replace function public.set_crm_task_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  if new.status = 'completed' and old.status is distinct from 'completed' then
    new.completed_at = now();
  elsif new.status <> 'completed' then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists crm_tasks_set_updated_at on public.crm_tasks;
create trigger crm_tasks_set_updated_at
before update on public.crm_tasks
for each row execute function public.set_crm_task_updated_at();

-- Durable inbox for suggestions generated on demand by an authenticated admin.
-- This table records review decisions; proposed actions are never executed by triggers.
create table if not exists public.crm_ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('customer', 'enquiry', 'booking')),
  entity_id uuid not null,
  suggestion_type text not null check (suggestion_type in ('reply_draft', 'follow_up', 'record_update', 'booking_risk')),
  title text not null check (length(trim(title)) > 0),
  rationale text,
  evidence jsonb not null default '[]'::jsonb,
  proposed_action jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'applied', 'failed')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  applied_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists crm_ai_suggestions_status_created_at_idx
  on public.crm_ai_suggestions (status, created_at desc);

alter table public.customers enable row level security;
alter table public.bookings enable row level security;
alter table public.crm_tasks enable row level security;
alter table public.crm_ai_suggestions enable row level security;

-- CRM records are only accessed through server handlers after isAdminUser checks.
-- No anonymous/authenticated Data API policies are granted for these tables.
revoke all on public.customers, public.bookings, public.crm_tasks, public.crm_ai_suggestions from anon, authenticated;
grant all on public.customers, public.bookings, public.crm_tasks, public.crm_ai_suggestions to service_role;
