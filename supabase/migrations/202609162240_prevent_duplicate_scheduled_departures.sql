create unique index if not exists hikes_scheduled_source_date_idx
on public.hikes(source_hike_id, date)
where booking_type = 'scheduled_group' and source_hike_id is not null and date is not null;
