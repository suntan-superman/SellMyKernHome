begin transaction read only;

with service_role_facts as (
  select
    r.oid,
    r.rolsuper,
    r.rolbypassrls,
    (select pg_catalog.count(*) from pg_catalog.pg_auth_members as m where m.member = r.oid) as inherited_role_count
  from pg_catalog.pg_roles as r
  where r.rolname = 'service_role'
), lead_table_facts as (
  select c.relowner
  from pg_catalog.pg_class as c
  where c.oid = 'public.gnz_leads'::pg_catalog.regclass
), privilege_facts as (
  select
    s.rolsuper,
    s.rolbypassrls,
    s.inherited_role_count,
    t.relowner = s.oid as service_is_owner,
    pg_catalog.has_table_privilege('anon', 'public.gnz_leads', 'select,insert,update,delete,truncate,references,trigger') as anon_any_lead_access,
    pg_catalog.has_table_privilege('authenticated', 'public.gnz_leads', 'select,insert,update,delete,truncate,references,trigger') as authenticated_any_lead_access,
    pg_catalog.has_table_privilege('service_role', 'public.gnz_leads', 'select') as service_select,
    pg_catalog.has_table_privilege('service_role', 'public.gnz_leads', 'insert') as service_insert,
    pg_catalog.has_table_privilege('service_role', 'public.gnz_leads', 'update') as service_update,
    pg_catalog.has_table_privilege('service_role', 'public.gnz_leads', 'delete') as service_delete,
    pg_catalog.has_table_privilege('service_role', 'public.gnz_leads', 'truncate') as service_truncate,
    pg_catalog.has_table_privilege('service_role', 'public.gnz_leads', 'references') as service_references,
    pg_catalog.has_table_privilege('service_role', 'public.gnz_leads', 'trigger') as service_trigger,
    pg_catalog.has_table_privilege('service_role', 'public.gnz_leads', 'maintain') as service_maintain
  from service_role_facts as s
  cross join lead_table_facts as t
), object_facts as (
  select
    (select pg_catalog.count(*) from information_schema.columns where table_schema = 'public' and table_name = 'gnz_leads' and column_name in ('lead_type', 'source_site', 'preferred_contact', 'property_address', 'property_city', 'property_zip', 'property_type', 'property_condition', 'occupancy', 'desired_timing', 'attribution', 'consent', 'assigned_to')) as seller_column_count,
    (select pg_catalog.count(*) from pg_catalog.pg_class as c join pg_catalog.pg_namespace as n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname in ('smkh_notification_logs', 'smkh_lead_audit', 'smkh_rate_limits')) as seller_table_count,
    (select pg_catalog.count(*) from pg_catalog.pg_proc as p join pg_catalog.pg_namespace as n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname in ('smkh_audit_seller_lead', 'smkh_check_rate_limit', 'smkh_admin_update_lead')) as seller_function_count,
    (select pg_catalog.count(*) from pg_catalog.pg_trigger where tgrelid = 'public.gnz_leads'::pg_catalog.regclass and tgname = 'smkh_seller_lead_audit' and not tgisinternal) as seller_trigger_count,
    (select pg_catalog.bool_and(c.relrowsecurity) from pg_catalog.pg_class as c join pg_catalog.pg_namespace as n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname in ('gnz_leads', 'smkh_notification_logs', 'smkh_lead_audit', 'smkh_rate_limits')) as all_rls_enabled
)
select pg_catalog.jsonb_build_object(
  'gnz_lead_count', (select pg_catalog.count(*) from public.gnz_leads),
  'admin_membership_count', (select pg_catalog.count(*) from public.admin_users),
  'seller_lead_count', (select pg_catalog.count(*) from public.gnz_leads where lead_type = 'seller'),
  'seller_column_count', o.seller_column_count,
  'seller_table_count', o.seller_table_count,
  'seller_function_count', o.seller_function_count,
  'seller_trigger_count', o.seller_trigger_count,
  'all_rls_enabled', o.all_rls_enabled,
  'service_is_owner', p.service_is_owner,
  'service_superuser', p.rolsuper,
  'service_bypassrls', p.rolbypassrls,
  'service_inherited_role_count', p.inherited_role_count,
  'anon_any_lead_access', p.anon_any_lead_access,
  'authenticated_any_lead_access', p.authenticated_any_lead_access,
  'service_lead_select', p.service_select,
  'service_lead_insert', p.service_insert,
  'service_lead_update', p.service_update,
  'service_lead_delete', p.service_delete,
  'service_lead_truncate', p.service_truncate,
  'service_lead_references', p.service_references,
  'service_lead_trigger', p.service_trigger,
  'service_lead_maintain', p.service_maintain,
  'anon_rate_rpc', pg_catalog.has_function_privilege('anon', 'public.smkh_check_rate_limit(text,integer,integer)', 'execute'),
  'authenticated_rate_rpc', pg_catalog.has_function_privilege('authenticated', 'public.smkh_check_rate_limit(text,integer,integer)', 'execute'),
  'service_rate_rpc', pg_catalog.has_function_privilege('service_role', 'public.smkh_check_rate_limit(text,integer,integer)', 'execute'),
  'anon_admin_rpc', pg_catalog.has_function_privilege('anon', 'public.smkh_admin_update_lead(uuid,text,text,uuid,uuid)', 'execute'),
  'authenticated_admin_rpc', pg_catalog.has_function_privilege('authenticated', 'public.smkh_admin_update_lead(uuid,text,text,uuid,uuid)', 'execute'),
  'service_admin_rpc', pg_catalog.has_function_privilege('service_role', 'public.smkh_admin_update_lead(uuid,text,text,uuid,uuid)', 'execute'),
  'service_trigger_function', pg_catalog.has_function_privilege('service_role', 'public.smkh_audit_seller_lead()', 'execute'),
  'status_constraint', (select pg_catalog.pg_get_constraintdef(c.oid) from pg_catalog.pg_constraint as c where c.conrelid = 'public.gnz_leads'::pg_catalog.regclass and c.conname = 'gnz_leads_status_check'),
  'postflight_gate_pass',
    o.seller_column_count = 13 and o.seller_table_count = 3
    and o.seller_function_count = 3 and o.seller_trigger_count = 1
    and o.all_rls_enabled
    and not p.anon_any_lead_access and not p.authenticated_any_lead_access
    and p.service_select and p.service_insert and p.service_update
    and not p.service_delete and not p.service_truncate
    and not p.service_references and not p.service_trigger and not p.service_maintain
    and not p.service_is_owner and not p.rolsuper and p.inherited_role_count = 0
    and not pg_catalog.has_function_privilege('anon', 'public.smkh_check_rate_limit(text,integer,integer)', 'execute')
    and not pg_catalog.has_function_privilege('authenticated', 'public.smkh_check_rate_limit(text,integer,integer)', 'execute')
    and pg_catalog.has_function_privilege('service_role', 'public.smkh_check_rate_limit(text,integer,integer)', 'execute')
    and not pg_catalog.has_function_privilege('anon', 'public.smkh_admin_update_lead(uuid,text,text,uuid,uuid)', 'execute')
    and not pg_catalog.has_function_privilege('authenticated', 'public.smkh_admin_update_lead(uuid,text,text,uuid,uuid)', 'execute')
    and pg_catalog.has_function_privilege('service_role', 'public.smkh_admin_update_lead(uuid,text,text,uuid,uuid)', 'execute')
    and not pg_catalog.has_function_privilege('service_role', 'public.smkh_audit_seller_lead()', 'execute')
) from privilege_facts as p cross join object_facts as o;

commit;
