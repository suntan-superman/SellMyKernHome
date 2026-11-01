-- NON-DESTRUCTIVE EMERGENCY ACCESS DISABLEMENT ONLY.
-- Retains every SMKH table, membership, lead, audit event, notification, and rate-limit row.
-- Never run automatically. A database owner must explicitly set the transaction-local latch.
begin;

do $safety$
begin
  if pg_catalog.current_setting('smkh.allow_access_disable', true) <> 'reviewed-and-authorized' then
    raise exception 'SMKH access disablement blocked; explicit reviewed authorization is required.';
  end if;
  if pg_catalog.to_regclass('public.smkh_leads') is null then
    raise exception 'SMKH schema is not present; stop without changing PropertyIntelligence.';
  end if;
end;
$safety$;

revoke all on public.smkh_admin_memberships, public.smkh_leads, public.smkh_lead_events,
  public.smkh_notifications, public.smkh_rate_limits from public, anon, authenticated, service_role;
revoke all on function public.smkh_audit_independent_lead() from public, anon, authenticated, service_role;
revoke all on function public.smkh_update_lead(pg_catalog.uuid,pg_catalog.text,pg_catalog.text,pg_catalog.timestamptz,pg_catalog.timestamptz)
  from public, anon, authenticated, service_role;
revoke all on function public.smkh_check_rate_limit(pg_catalog.text,pg_catalog.int4,pg_catalog.int4)
  from public, anon, authenticated, service_role;

commit;
