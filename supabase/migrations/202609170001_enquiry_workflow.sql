alter table public.enquiries
  add column if not exists priority text not null default 'normal',
  add column if not exists next_action text,
  add column if not exists next_follow_up_at timestamptz,
  add column if not exists quote_amount numeric,
  add column if not exists lost_reason text,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.enquiry_activities (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  type text not null,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid null
);

create index if not exists enquiry_activities_enquiry_id_created_at_idx on public.enquiry_activities(enquiry_id, created_at desc);
create index if not exists enquiries_status_idx on public.enquiries(status);
create index if not exists enquiries_next_follow_up_at_idx on public.enquiries(next_follow_up_at);

alter table public.enquiry_activities enable row level security;
drop policy if exists "Authenticated users can read enquiry activities" on public.enquiry_activities;
drop policy if exists "Authenticated users can insert enquiry activities" on public.enquiry_activities;
create policy "Authenticated users can read enquiry activities" on public.enquiry_activities for select to authenticated using (true);
create policy "Authenticated users can insert enquiry activities" on public.enquiry_activities for insert to authenticated with check (true);

create or replace function public.set_enquiry_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists enquiries_set_updated_at on public.enquiries;
create trigger enquiries_set_updated_at before update on public.enquiries for each row execute function public.set_enquiry_updated_at();
