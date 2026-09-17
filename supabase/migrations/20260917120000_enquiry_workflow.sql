-- Enquiry workflow improvements
-- Keeps each enquiry independent; no customer/deduplication model is introduced.

alter table public.enquiries
  drop constraint if exists enquiries_status_check;

alter table public.enquiries
  add constraint enquiries_status_check
  check (status in ('new', 'contacted', 'quoted', 'awaiting_reply', 'confirmed', 'completed', 'closed'));

alter table public.enquiries
  add column if not exists priority text not null default 'normal',
  add column if not exists next_action text,
  add column if not exists next_follow_up_at timestamptz,
  add column if not exists quote_amount numeric(12,2),
  add column if not exists lost_reason text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.enquiries
  add constraint enquiries_priority_check
  check (priority in ('normal', 'high', 'urgent'));

create or replace function public.set_enquiry_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists enquiries_set_updated_at on public.enquiries;
create trigger enquiries_set_updated_at
before update on public.enquiries
for each row execute function public.set_enquiry_updated_at();

create table if not exists public.enquiry_activities (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  type text not null check (type in ('note', 'status_change', 'follow_up', 'quote')),
  body text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists enquiry_activities_enquiry_id_created_at_idx
  on public.enquiry_activities (enquiry_id, created_at desc);

alter table public.enquiry_activities enable row level security;

-- Activity records are written/read through authenticated admin server routes.
-- No public policies are intentionally granted.
