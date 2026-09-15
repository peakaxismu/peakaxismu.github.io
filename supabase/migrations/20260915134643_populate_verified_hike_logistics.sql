-- Reconstructed from the production migration ledger using the live verified catalogue.
-- Keep the migration idempotent so it is safe to replay on a clean database.

update public.hikes
set
  logistics_source = 'Peak Axis verified trail logistics',
  logistics_verified_at = coalesce(logistics_verified_at, now())
where logistics_source is null;
