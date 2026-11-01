-- READ ONLY. Run immediately after the migration and before any application deployment.
begin transaction isolation level repeatable read read only;

select current_database() as database_name, pg_catalog.current_user as database_role,
       pg_catalog.now() as checked_at;

select
  (select count(*) from public.gnz_leads) as gnz_leads_total,
  (select count(*) from public.gnz_leads where lead_type = 'seller' or source_site = 'sellmykernhome.com') as smkh_source_leads,
  (select count(*) from public.gnz_leads where not (lead_type = 'seller' or source_site = 'sellmykernhome.com')) as unrelated_gnz_leads,
  (select count(*) from public.smkh_leads) as independent_smkh_leads,
  (select count(*) from public.admin_users) as source_admin_memberships,
  (select count(*) from public.smkh_admin_memberships) as independent_admin_memberships;

select
  count(*) filter (where l.id is null) as source_sellers_missing_from_smkh,
  count(*) filter (where l.legacy_gnz_lead_id is distinct from g.id) as invalid_legacy_links
from public.gnz_leads g
left join public.smkh_leads l on l.id = g.id
where g.lead_type = 'seller' or g.source_site = 'sellmykernhome.com';

select status, legacy_status, count(*) as records
from public.smkh_leads
group by status, legacy_status
order by status, legacy_status;

select c.relname, c.relrowsecurity, c.relforcerowsecurity, pg_catalog.pg_get_userbyid(c.relowner) as owner
from pg_catalog.pg_class c
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('smkh_admin_memberships', 'smkh_leads', 'smkh_lead_events', 'smkh_notifications')
order by c.relname;

select
  has_table_privilege('anon', 'public.smkh_leads', 'select') as anon_select,
  has_table_privilege('authenticated', 'public.smkh_leads', 'select') as authenticated_select_via_rls,
  has_table_privilege('service_role', 'public.smkh_leads', 'select') as service_select,
  has_table_privilege('service_role', 'public.smkh_leads', 'insert') as service_insert,
  has_table_privilege('service_role', 'public.smkh_leads', 'update') as service_update,
  has_table_privilege('service_role', 'public.smkh_leads', 'delete') as service_delete,
  has_function_privilege('anon', 'public.smkh_update_lead(uuid,text,text,timestamptz,timestamptz)', 'execute') as anon_rpc,
  has_function_privilege('authenticated', 'public.smkh_update_lead(uuid,text,text,timestamptz,timestamptz)', 'execute') as authenticated_rpc,
  has_function_privilege('service_role', 'public.smkh_update_lead(uuid,text,text,timestamptz,timestamptz)', 'execute') as service_rpc;

select schemaname, tablename, policyname, roles, cmd, qual
from pg_catalog.pg_policies
where schemaname = 'public'
  and tablename in ('smkh_admin_memberships', 'smkh_leads', 'smkh_lead_events', 'smkh_notifications')
order by tablename, policyname;

select p.proname, p.prosecdef, p.proconfig, pg_catalog.pg_get_function_identity_arguments(p.oid) as arguments
from pg_catalog.pg_proc p
join pg_catalog.pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname in ('smkh_audit_independent_lead', 'smkh_update_lead')
order by p.proname;

rollback;
