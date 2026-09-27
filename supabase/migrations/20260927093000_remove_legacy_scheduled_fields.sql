set local lock_timeout = '5s';

alter table public.hikes
  drop column if exists date,
  drop column if exists spots_total,
  drop column if exists spots_remaining;
