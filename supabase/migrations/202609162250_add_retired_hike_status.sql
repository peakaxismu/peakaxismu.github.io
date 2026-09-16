alter table public.hikes drop constraint if exists hikes_status_check;
alter table public.hikes add constraint hikes_status_check check (status = any (array['draft'::text, 'published'::text, 'retired'::text]));
