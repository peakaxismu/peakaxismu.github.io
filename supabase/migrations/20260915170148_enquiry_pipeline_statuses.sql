alter table public.enquiries drop constraint if exists enquiries_status_check;
alter table public.enquiries add constraint enquiries_status_check check (status in ('new', 'contacted', 'quoted', 'confirmed', 'completed', 'closed'));
