alter table public.hikes
  add column if not exists source_hike_id uuid references public.hikes(id) on delete set null;

create index if not exists hikes_source_hike_id_idx
  on public.hikes(source_hike_id);
