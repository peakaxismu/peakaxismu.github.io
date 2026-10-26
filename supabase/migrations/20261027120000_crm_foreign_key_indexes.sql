-- Index CRM foreign keys used for joins, ownership references, and delete checks.
-- Keep the high-traffic relationship lookups indexed as the CRM grows.

create index if not exists bookings_created_by_idx
  on public.bookings (created_by);

create index if not exists bookings_expedition_id_idx
  on public.bookings (expedition_id);

create index if not exists crm_ai_suggestions_reviewed_by_idx
  on public.crm_ai_suggestions (reviewed_by);

create index if not exists crm_tasks_booking_id_idx
  on public.crm_tasks (booking_id);

create index if not exists crm_tasks_created_by_idx
  on public.crm_tasks (created_by);

create index if not exists crm_tasks_enquiry_id_idx
  on public.crm_tasks (enquiry_id);
