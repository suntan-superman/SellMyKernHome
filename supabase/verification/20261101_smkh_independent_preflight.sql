-- READ ONLY. Run immediately before the authorized production migration.
-- Save the complete output with the release record and compare it to the backup manifest.
begin transaction isolation level repeatable read read only;

select current_database() as database_name, pg_catalog.current_user as database_role,
       pg_catalog.now() as checked_at;

do $preflight$
begin
  if pg_catalog.to_regclass('public.gnz_leads') is null
     or pg_catalog.to_regclass('public.admin_users') is null
     or pg_catalog.to_regclass('public.smkh_lead_audit') is null
     or pg_catalog.to_regclass('public.smkh_notification_logs') is null
     or pg_catalog.to_regclass('public.smkh_rate_limits') is null then
    raise exception 'A required verified source object is missing.';
  end if;
  if pg_catalog.to_regclass('public.smkh_leads') is not null
     or pg_catalog.to_regclass('public.smkh_admin_memberships') is not null
     or pg_catalog.to_regclass('public.smkh_lead_events') is not null
     or pg_catalog.to_regclass('public.smkh_notifications') is not null then
    raise exception 'Independent SMKH objects already exist; stop to prevent an unreviewed repeat application.';
  end if;
end;
$preflight$;

select
  (select count(*) from public.gnz_leads) as gnz_leads_total,
  (select count(*) from public.gnz_leads where lead_type = 'seller' or source_site = 'sellmykernhome.com') as smkh_source_leads,
  (select count(*) from public.gnz_leads where not (lead_type = 'seller' or source_site = 'sellmykernhome.com')) as unrelated_gnz_leads,
  (select count(*) from public.admin_users) as source_admin_memberships,
  (select count(*) from public.smkh_lead_audit) as source_audit_events,
  (select count(*) from public.smkh_notification_logs) as source_notification_logs,
  (select count(*) from public.smkh_rate_limits) as rate_limit_buckets;

select lead_type, source_site, status, (archived_at is not null) as archived, count(*) as records
from public.gnz_leads
group by lead_type, source_site, status, (archived_at is not null)
order by lead_type, source_site, status, archived;

select count(*) as seller_rows_with_missing_required_values
from public.gnz_leads
where (lead_type = 'seller' or source_site = 'sellmykernhome.com')
  and (
    reference is null or submission_token is null or first_name is null
    or preferred_contact is null or preferred_contact not in ('email', 'phone')
    or property_address is null or property_address = ''
    or property_city is null or property_city = ''
    or property_zip is null or property_zip = ''
    or attribution is null or consent is null
  );

select c.relname, c.relrowsecurity, c.relforcerowsecurity, pg_catalog.pg_get_userbyid(c.relowner) as owner
from pg_catalog.pg_class c
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('gnz_leads', 'admin_users', 'smkh_lead_audit', 'smkh_notification_logs', 'smkh_rate_limits')
order by c.relname;

select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('gnz_leads', 'admin_users', 'smkh_lead_audit', 'smkh_notification_logs', 'smkh_rate_limits')
order by table_name, grantee, privilege_type;

rollback;
