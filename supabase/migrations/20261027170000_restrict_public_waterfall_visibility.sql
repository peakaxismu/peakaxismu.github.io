-- Normalize legacy waterfall statuses without hiding routes that are already public.
update public.waterfalls
set status = 'published'
where lower(status) not in ('draft', 'published');

-- Draft routes should not be readable by public/anonymous visitors.
drop policy if exists "Public can read published waterfalls" on public.waterfalls;
create policy "Public can read published waterfalls" on public.waterfalls
  for select using (status = 'published');
