begin transaction read only;

with service_role_facts as (
  select
    r.oid,
    r.rolsuper,
    r.rolinherit,
    r.rolbypassrls,
    (select pg_catalog.count(*) from pg_catalog.pg_auth_members as m where m.member = r.oid) as inherited_role_count
  from pg_catalog.pg_roles as r
  where r.rolname = 'service_role'
), lead_table_facts as (
  select
    c.relowner,
    c.relrowsecurity,
    c.relforcerowsecurity,
    pg_catalog.pg_get_userbyid(c.relowner) as table_owner
  from pg_catalog.pg_class as c
  join pg_catalog.pg_namespace as n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = 'gnz_leads'
), direct_service_acl as (
  select coalesce(
    pg_catalog.jsonb_agg(a.privilege_type order by a.privilege_type),
    '[]'::pg_catalog.jsonb
  ) as privileges
  from pg_catalog.pg_class as c
  cross join lateral pg_catalog.aclexplode(
    coalesce(c.relacl, pg_catalog.acldefault('r', c.relowner))
  ) as a
  join pg_catalog.pg_roles as grantee on grantee.oid = a.grantee
  where c.oid = 'public.gnz_leads'::pg_catalog.regclass
    and grantee.rolname = 'service_role'
), facts as (
  select
    s.*,
    t.*,
    a.privileges,
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
  cross join direct_service_acl as a
)
select pg_catalog.jsonb_build_object(
  'gnz_leads_exists', pg_catalog.to_regclass('public.gnz_leads') is not null,
  'admin_users_exists', pg_catalog.to_regclass('public.admin_users') is not null,
  'gnz_lead_count', (select pg_catalog.count(*) from public.gnz_leads),
  'admin_membership_count', (select pg_catalog.count(*) from public.admin_users),
  'unexpected_status_count', (select pg_catalog.count(*) from public.gnz_leads where status not in ('new', 'contacted', 'qualified', 'closed')),
  'rls_enabled', f.relrowsecurity,
  'rls_forced', f.relforcerowsecurity,
  'table_owner', f.table_owner,
  'service_is_owner', f.service_is_owner,
  'service_superuser', f.rolsuper,
  'service_inherit', f.rolinherit,
  'service_bypassrls', f.rolbypassrls,
  'service_inherited_role_count', f.inherited_role_count,
  'service_direct_privileges_before_migration', f.privileges,
  'service_select', f.service_select,
  'service_insert', f.service_insert,
  'service_update', f.service_update,
  'service_delete_before_migration', f.service_delete,
  'service_truncate_before_migration', f.service_truncate,
  'service_references_before_migration', f.service_references,
  'service_trigger_before_migration', f.service_trigger,
  'service_maintain_before_migration', f.service_maintain,
  'expected_preexisting_service_delete_remediation', f.service_delete,
  'expected_service_privilege_reset_required', f.service_delete or f.service_truncate or f.service_references or f.service_trigger or f.service_maintain,
  'anon_any_lead_access', f.anon_any_lead_access,
  'authenticated_any_lead_access', f.authenticated_any_lead_access,
  'browser_policy_count', (
    select pg_catalog.count(*)
    from pg_catalog.pg_policies
    where schemaname = 'public' and tablename = 'gnz_leads'
      and roles && array['anon', 'authenticated']::name[]
  ),
  'seller_column_count', (
    select pg_catalog.count(*)
    from information_schema.columns
    where table_schema = 'public' and table_name = 'gnz_leads'
      and column_name in ('lead_type', 'source_site', 'preferred_contact', 'property_address', 'property_city', 'property_zip', 'property_type', 'property_condition', 'occupancy', 'desired_timing', 'attribution', 'consent', 'assigned_to')
  ),
  'seller_table_count', (
    select pg_catalog.count(*)
    from pg_catalog.pg_class as c
    join pg_catalog.pg_namespace as n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname in ('smkh_notification_logs', 'smkh_lead_audit', 'smkh_rate_limits')
  ),
  'seller_function_count', (
    select pg_catalog.count(*)
    from pg_catalog.pg_proc as p
    join pg_catalog.pg_namespace as n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in ('smkh_audit_seller_lead', 'smkh_check_rate_limit', 'smkh_admin_update_lead')
  ),
  'status_constraint', (
    select pg_catalog.pg_get_constraintdef(c.oid)
    from pg_catalog.pg_constraint as c
    where c.conrelid = 'public.gnz_leads'::pg_catalog.regclass and c.conname = 'gnz_leads_status_check'
  ),
  'preflight_gate_pass',
    f.relrowsecurity
    and not f.anon_any_lead_access
    and not f.authenticated_any_lead_access
    and f.service_select and f.service_insert and f.service_update
    and not f.service_is_owner and not f.rolsuper and f.inherited_role_count = 0
    and (select pg_catalog.count(*) from public.gnz_leads where status not in ('new', 'contacted', 'qualified', 'closed')) = 0
    and (select pg_catalog.count(*) from information_schema.columns where table_schema = 'public' and table_name = 'gnz_leads' and column_name = 'lead_type') = 0
) from facts as f;

commit;
