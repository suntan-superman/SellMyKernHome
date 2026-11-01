-- READ ONLY. Run immediately after the migration and before any application deployment.
begin transaction isolation level repeatable read read only;

select current_database() as database_name, current_user as database_role,
       pg_catalog.now() as checked_at;

do $postflight$
begin
  if nullif(pg_catalog.current_setting('smkh.bootstrap_owner_user_id', true), '') is null
     or nullif(pg_catalog.current_setting('smkh.bootstrap_owner_email', true), '') is null then
    raise exception 'Verified owner bootstrap context is required for postflight.';
  end if;
  if (select count(*) from public.smkh_admin_memberships) <> 1 then
    raise exception 'Postflight requires exactly one independent SMKH membership.';
  end if;
  if not exists (
    select 1
    from public.smkh_admin_memberships m
    join auth.users u on u.id = m.user_id
    where m.user_id = pg_catalog.current_setting('smkh.bootstrap_owner_user_id')::pg_catalog.uuid
      and pg_catalog.lower(u.email) = pg_catalog.lower(pg_catalog.current_setting('smkh.bootstrap_owner_email'))
      and m.role = 'owner' and m.active
  ) then
    raise exception 'The sole SMKH membership is not the verified active owner.';
  end if;
  if (select count(*) from public.smkh_leads) <>
     (select count(*) from public.gnz_leads where lead_type = 'seller' or source_site = 'sellmykernhome.com') then
    raise exception 'Independent lead count does not match the preserved SMKH source set.';
  end if;
  if exists (
    select 1 from public.gnz_leads g
    left join public.smkh_leads l on l.legacy_gnz_lead_id = g.id
    where (g.lead_type = 'seller' or g.source_site = 'sellmykernhome.com')
      and (
        l.id is null or l.attribution is distinct from g.attribution
        or l.consent is distinct from g.consent
        or l.legacy_assigned_to is distinct from g.assigned_to
        or l.archived_at is distinct from g.archived_at
        or l.archived_by is distinct from g.archived_by
        or row(
          l.reference, l.submission_token, l.source, l.source_site,
          l.created_at, l.updated_at, l.first_name, l.last_name, l.company_name,
          l.phone, l.email, l.preferred_contact, l.service, l.message,
          l.property_address, l.property_city, l.property_zip, l.property_type,
          l.property_condition, l.occupancy, l.desired_timing, l.internal_notes
        ) is distinct from row(
          g.reference, g.submission_token, g.source, g.source_site,
          g.created_at, g.updated_at, g.first_name, g.last_name, g.company_name,
          g.phone, g.email, g.preferred_contact, g.service, g.message,
          g.property_address, g.property_city, g.property_zip, g.property_type,
          g.property_condition, g.occupancy, g.desired_timing, g.internal_notes
        )
      )
  ) then
    raise exception 'A copied seller record is missing or does not preserve source history.';
  end if;
  if (select count(*) from public.smkh_lead_events where legacy_audit_id is not null) <>
     (select count(*) from public.smkh_lead_audit a join public.smkh_leads l on l.id = a.lead_id) then
    raise exception 'Historical seller audit events were not copied completely.';
  end if;
  if (select count(*) from public.smkh_notifications where legacy_notification_id is not null) <>
     (select count(*) from public.smkh_notification_logs n join public.smkh_leads l on l.id = n.lead_id) then
    raise exception 'Historical seller notification records were not copied completely.';
  end if;
end;
$postflight$;

select
  (select count(*) from public.gnz_leads) as gnz_leads_total,
  (select count(*) from public.gnz_leads where lead_type = 'seller' or source_site = 'sellmykernhome.com') as smkh_source_leads,
  (select count(*) from public.gnz_leads where not (lead_type = 'seller' or source_site = 'sellmykernhome.com')) as unrelated_gnz_leads,
  (select count(*) from public.smkh_leads) as independent_smkh_leads,
  (select count(*) from public.admin_users) as source_admin_memberships,
  (select count(*) from public.smkh_admin_memberships) as independent_admin_memberships,
  (select count(*) from public.smkh_admin_memberships where role = 'owner' and active) as active_owner_memberships;

select
  count(*) = 1 as exactly_one_membership,
  bool_and(m.role = 'owner' and m.active) as membership_is_active_owner,
  bool_and(u.id is not null) as membership_has_auth_user,
  bool_and(m.user_id = pg_catalog.current_setting('smkh.bootstrap_owner_user_id')::pg_catalog.uuid) as membership_matches_verified_owner
from public.smkh_admin_memberships m
left join auth.users u on u.id = m.user_id;

select
  count(*) filter (where l.id is null) as source_sellers_missing_from_smkh,
  count(*) filter (where l.legacy_gnz_lead_id is distinct from g.id) as invalid_legacy_links,
  count(*) filter (where l.attribution is distinct from g.attribution) as attribution_mismatches,
  count(*) filter (where l.consent is distinct from g.consent) as consent_mismatches,
  count(*) filter (where l.legacy_assigned_to is distinct from g.assigned_to) as historical_assignment_mismatches,
  count(*) filter (where row(
    l.reference, l.submission_token, l.source, l.source_site,
    l.created_at, l.updated_at, l.first_name, l.last_name, l.company_name,
    l.phone, l.email, l.preferred_contact, l.service, l.message,
    l.property_address, l.property_city, l.property_zip, l.property_type,
    l.property_condition, l.occupancy, l.desired_timing, l.internal_notes
  ) is distinct from row(
    g.reference, g.submission_token, g.source, g.source_site,
    g.created_at, g.updated_at, g.first_name, g.last_name, g.company_name,
    g.phone, g.email, g.preferred_contact, g.service, g.message,
    g.property_address, g.property_city, g.property_zip, g.property_type,
    g.property_condition, g.occupancy, g.desired_timing, g.internal_notes
  )) as seller_field_mismatches
from public.gnz_leads g
left join public.smkh_leads l on l.legacy_gnz_lead_id = g.id
where g.lead_type = 'seller' or g.source_site = 'sellmykernhome.com';

select
  (select count(*) from public.smkh_lead_audit a join public.smkh_leads l on l.id = a.lead_id) as source_seller_audit_events,
  (select count(*) from public.smkh_lead_events where legacy_audit_id is not null) as copied_seller_audit_events,
  (select count(*) from public.smkh_notification_logs n join public.smkh_leads l on l.id = n.lead_id) as source_seller_notification_records,
  (select count(*) from public.smkh_notifications where legacy_notification_id is not null) as copied_seller_notification_records;

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
  has_table_privilege('service_role', 'public.smkh_admin_memberships', 'insert,update,delete') as service_membership_mutation,
  has_table_privilege('service_role', 'public.smkh_lead_events', 'insert,update,delete') as service_event_mutation,
  has_table_privilege('service_role', 'public.smkh_notifications', 'update,delete') as service_notification_mutation,
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
