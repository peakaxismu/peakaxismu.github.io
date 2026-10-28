-- Trackable social/creator campaign links without collecting visitor IPs or social identities.
create table if not exists public.marketing_links (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9]{8,16}$'),
  label text not null check (length(trim(label)) between 2 and 120),
  platform text not null check (platform in ('instagram', 'tiktok', 'facebook', 'youtube', 'whatsapp', 'email', 'other')),
  account_handle text,
  campaign text not null check (length(trim(campaign)) between 1 and 120),
  destination_path text not null default '/enquire'
    check (destination_path ~ '^/[^/]' or destination_path = '/'),
  utm_source text not null,
  utm_medium text not null,
  utm_campaign text not null,
  utm_content text,
  is_active boolean not null default true,
  click_count bigint not null default 0 check (click_count >= 0),
  last_clicked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketing_links_active_created_idx
  on public.marketing_links (is_active, created_at desc);

alter table public.enquiries
  add column if not exists attribution_source text,
  add column if not exists attribution_medium text,
  add column if not exists attribution_campaign text,
  add column if not exists attribution_content text,
  add column if not exists attribution_referrer_host text,
  add column if not exists attribution_landing_path text,
  add column if not exists tracking_link_code text;

create index if not exists enquiries_tracking_link_code_idx
  on public.enquiries (tracking_link_code)
  where tracking_link_code is not null;

alter table public.marketing_links enable row level security;
revoke all on public.marketing_links from anon, authenticated;
grant all on public.marketing_links to service_role;

-- Atomic click increment; it deliberately stores no IP address, user agent, or visitor identity.
create or replace function public.record_marketing_link_click(p_code text)
returns setof public.marketing_links
language sql
security definer
set search_path = public
as $$
  update public.marketing_links
  set click_count = click_count + 1,
      last_clicked_at = now(),
      updated_at = now()
  where code = p_code
    and is_active = true
  returning *;
$$;

revoke all on function public.record_marketing_link_click(text) from public, anon, authenticated;
grant execute on function public.record_marketing_link_click(text) to service_role;
