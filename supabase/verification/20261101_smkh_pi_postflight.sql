-- Run immediately after the authorized PI migration in the same owner-context session.
do $postflight$
begin
  if nullif(pg_catalog.current_setting('smkh.bootstrap_owner_user_id', true), '') is null then
    raise exception 'Verified PI owner bootstrap context is required for postflight.';
  end if;
  if (select count(*) from public.smkh_admin_memberships) <> 1
     or not exists (
       select 1 from public.smkh_admin_memberships
       where user_id = pg_catalog.current_setting('smkh.bootstrap_owner_user_id')::pg_catalog.uuid
         and role = 'owner' and active
     ) then
    raise exception 'Exactly one active PI-verified SMKH owner membership is required.';
  end if;
  if (select count(*) from public.smkh_leads) <> 0
     or (select count(*) from public.smkh_lead_events) <> 0
     or (select count(*) from public.smkh_notifications) <> 0
     or (select count(*) from public.smkh_rate_limits) <> 0 then
    raise exception 'New SMKH operational tables must be empty immediately after migration.';
  end if;
  if exists (
    select 1 from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relname in ('smkh_admin_memberships','smkh_leads','smkh_lead_events','smkh_notifications','smkh_rate_limits')
      and not c.relrowsecurity
  ) then
    raise exception 'RLS is not enabled on every SMKH table.';
  end if;
  if pg_catalog.has_table_privilege('anon','public.smkh_leads','select')
     or pg_catalog.has_table_privilege('service_role','public.smkh_leads','update,delete')
     or pg_catalog.has_table_privilege('service_role','public.smkh_admin_memberships','insert,update,delete')
     or pg_catalog.has_table_privilege('service_role','public.smkh_lead_events','insert,update,delete')
     or pg_catalog.has_table_privilege('service_role','public.smkh_notifications','update,delete')
     or pg_catalog.has_table_privilege('service_role','public.smkh_rate_limits','select,insert,update,delete') then
    raise exception 'An SMKH table has an excessive effective privilege.';
  end if;
  if not pg_catalog.has_table_privilege('service_role','public.smkh_leads','select,insert')
     or not pg_catalog.has_table_privilege('service_role','public.smkh_notifications','select,insert')
     or not pg_catalog.has_function_privilege('service_role','public.smkh_check_rate_limit(text,integer,integer)','execute')
     or pg_catalog.has_function_privilege('anon','public.smkh_check_rate_limit(text,integer,integer)','execute')
     or pg_catalog.has_function_privilege('service_role','public.smkh_update_lead(uuid,text,text,timestamptz,timestamptz)','execute')
     or not pg_catalog.has_function_privilege('authenticated','public.smkh_update_lead(uuid,text,text,timestamptz,timestamptz)','execute') then
    raise exception 'SMKH function or required server privilege verification failed.';
  end if;
end;
$postflight$;

select
  (select count(*) from public.smkh_admin_memberships) as owner_memberships,
  (select count(*) from public.smkh_leads) as leads,
  (select count(*) from public.smkh_lead_events) as audit_events,
  (select count(*) from public.smkh_notifications) as notifications,
  (select count(*) from public.smkh_rate_limits) as rate_limit_rows;

select c.relname, c.relrowsecurity, c.relforcerowsecurity,
       pg_catalog.pg_get_userbyid(c.relowner) as owner
from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in ('smkh_admin_memberships','smkh_leads','smkh_lead_events','smkh_notifications','smkh_rate_limits')
order by c.relname;

select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema='public' and table_name in ('smkh_admin_memberships','smkh_leads','smkh_lead_events','smkh_notifications','smkh_rate_limits')
order by table_name,grantee,privilege_type;

select n.nspname as schema_name,p.proname,pg_catalog.pg_get_function_identity_arguments(p.oid) as arguments,
       p.prosecdef,p.proconfig
from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in ('smkh_audit_independent_lead','smkh_update_lead','smkh_check_rate_limit')
order by p.proname;
