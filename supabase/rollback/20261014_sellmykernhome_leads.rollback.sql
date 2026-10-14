-- LAST-RESORT DESTRUCTIVE ROLLBACK.
-- This removes seller data, audit history, notification records, rate-limit
-- state, and shared lead columns. Prefer the non-destructive application
-- rollback in docs/migration-safety-and-rollback.md.
--
-- Never run automatically. Before use:
--   1. Capture and verify a restorable database backup.
--   2. Run every preflight query in the rollback guide.
--   3. Obtain explicit production authorization.
--   4. Manually uncomment the SET LOCAL line below.
begin;

-- Manual safety latch. Leave commented during normal operation and reviews.
-- set local smkh.allow_destructive_rollback = 'yes';

do $rollback_guard$
begin
  if pg_catalog.current_setting('smkh.allow_destructive_rollback', true)
    is distinct from 'yes'
  then
    raise exception
      'Destructive rollback blocked. Complete the backup and preflight procedure, then explicitly enable the transaction-local safety latch.';
  end if;

  if exists (
    select 1
    from public.gnz_leads
    where status in ('in_discussion', 'not_proceeding')
  ) then
    raise exception
      'Rollback blocked: leads use statuses unsupported by the legacy constraint. Review and explicitly resolve them first.';
  end if;
end;
$rollback_guard$;

drop trigger if exists smkh_seller_lead_audit on public.gnz_leads;
drop function if exists public.smkh_audit_seller_lead();
drop function if exists public.smkh_admin_update_lead(
  pg_catalog.uuid, pg_catalog.text, pg_catalog.text, pg_catalog.uuid, pg_catalog.uuid
);
drop function if exists public.smkh_check_rate_limit(
  pg_catalog.text, pg_catalog.int4, pg_catalog.int4
);
drop table if exists public.smkh_rate_limits;
drop table if exists public.smkh_lead_audit;
drop table if exists public.smkh_notification_logs;
drop index if exists public.gnz_leads_type_created_idx;
drop index if exists public.gnz_leads_source_site_idx;
alter table public.gnz_leads drop constraint if exists gnz_leads_lead_type_check;
alter table public.gnz_leads drop constraint if exists gnz_leads_preferred_contact_check;
alter table public.gnz_leads drop constraint if exists gnz_leads_status_check;
alter table public.gnz_leads add constraint gnz_leads_status_check
  check (status in ('new', 'contacted', 'qualified', 'closed'));
alter table public.gnz_leads
  drop column if exists lead_type,
  drop column if exists source_site,
  drop column if exists preferred_contact,
  drop column if exists property_address,
  drop column if exists property_city,
  drop column if exists property_zip,
  drop column if exists property_type,
  drop column if exists property_condition,
  drop column if exists occupancy,
  drop column if exists desired_timing,
  drop column if exists attribution,
  drop column if exists consent,
  drop column if exists assigned_to;
notify pgrst, 'reload schema';
commit;
