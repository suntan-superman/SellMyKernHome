-- DESTRUCTIVE: removes SellMyKernHome data and shared lead columns. Backup first.
-- Do not run automatically or against production without explicit approval.
begin;
drop trigger if exists smkh_seller_lead_audit on public.gnz_leads;
drop function if exists public.smkh_audit_seller_lead();
drop function if exists public.smkh_check_rate_limit(text, integer, integer);
drop table if exists public.smkh_rate_limits;
drop table if exists public.smkh_lead_audit;
drop table if exists public.smkh_notification_logs;
drop index if exists public.gnz_leads_type_created_idx;
drop index if exists public.gnz_leads_source_site_idx;
alter table public.gnz_leads drop constraint if exists gnz_leads_lead_type_check;
alter table public.gnz_leads drop constraint if exists gnz_leads_preferred_contact_check;
alter table public.gnz_leads drop constraint if exists gnz_leads_status_check;
alter table public.gnz_leads add constraint gnz_leads_status_check check (status in ('new', 'contacted', 'qualified', 'closed'));
alter table public.gnz_leads
  drop column if exists lead_type, drop column if exists source_site, drop column if exists preferred_contact,
  drop column if exists property_address, drop column if exists property_city, drop column if exists property_zip,
  drop column if exists property_type, drop column if exists property_condition, drop column if exists occupancy,
  drop column if exists desired_timing, drop column if exists attribution, drop column if exists consent, drop column if exists assigned_to;
notify pgrst, 'reload schema';
commit;

