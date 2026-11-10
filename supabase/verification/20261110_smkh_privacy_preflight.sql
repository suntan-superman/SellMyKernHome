do $preflight$
begin
  if pg_catalog.to_regclass('public.smkh_leads') is null
     or pg_catalog.to_regclass('public.smkh_admin_memberships') is null then
    raise exception 'Independent SMKH baseline schema is missing.';
  end if;
  if pg_catalog.to_regclass('public.smkh_privacy_requests') is not null
     or pg_catalog.to_regclass('public.smkh_sharing_suppressions') is not null then
    raise exception 'Privacy-choice objects already exist; do not apply twice.';
  end if;
end;
$preflight$;

select
  (select count(*) from public.smkh_leads) as lead_count,
  (select count(*) from public.smkh_admin_memberships where active) as active_admin_count,
  pg_catalog.has_table_privilege('service_role', 'public.smkh_leads', 'update') as service_role_can_update_leads;
