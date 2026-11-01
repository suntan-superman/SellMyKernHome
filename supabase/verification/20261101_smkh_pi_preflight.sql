-- READ ONLY. PropertyIntelligence target preflight for the empty SMKH schema.
begin transaction isolation level repeatable read read only;

select current_database() as database_name, current_user as database_role,
       pg_catalog.current_setting('server_version') as server_version,
       pg_catalog.now() as checked_at;

do $preflight$
declare
  owner_id_text pg_catalog.text := nullif(pg_catalog.current_setting('smkh.bootstrap_owner_user_id', true), '');
  owner_email pg_catalog.text := nullif(pg_catalog.current_setting('smkh.bootstrap_owner_email', true), '');
  owner_display_name pg_catalog.text := nullif(pg_catalog.current_setting('smkh.bootstrap_owner_display_name', true), '');
  owner_id pg_catalog.uuid;
  object_name pg_catalog.text;
begin
  if pg_catalog.to_regclass('auth.users') is null or pg_catalog.to_regprocedure('auth.uid()') is null then
    raise exception 'Required PropertyIntelligence Supabase Auth objects are missing.';
  end if;
  foreach object_name in array array[
    'public.smkh_admin_memberships', 'public.smkh_leads', 'public.smkh_lead_events',
    'public.smkh_notifications', 'public.smkh_rate_limits',
    'public.smkh_leads_status_created_idx', 'public.smkh_leads_follow_up_idx',
    'public.smkh_leads_assigned_idx', 'public.smkh_leads_source_created_idx',
    'public.smkh_lead_events_lead_idx', 'public.smkh_notifications_lead_idx'
  ] loop
    if pg_catalog.to_regclass(object_name) is not null then
      raise exception 'Target object collision: % already exists.', object_name;
    end if;
  end loop;
  if pg_catalog.to_regprocedure('public.smkh_audit_independent_lead()') is not null
     or pg_catalog.to_regprocedure('public.smkh_update_lead(uuid,text,text,timestamptz,timestamptz)') is not null
     or pg_catalog.to_regprocedure('public.smkh_check_rate_limit(text,integer,integer)') is not null then
    raise exception 'Target SMKH function collision detected.';
  end if;
  if owner_id_text is null or owner_email is null or owner_display_name is null then
    raise exception 'Verified PropertyIntelligence owner bootstrap context is required.';
  end if;
  begin owner_id := owner_id_text::pg_catalog.uuid;
  exception when invalid_text_representation then
    raise exception 'The verified PI owner Auth user ID is not a valid UUID.';
  end;
  if not exists (
    select 1 from auth.users
    where id = owner_id and pg_catalog.lower(email) = pg_catalog.lower(owner_email)
      and deleted_at is null and email_confirmed_at is not null
      and (banned_until is null or banned_until <= pg_catalog.now())
  ) then
    raise exception 'The supplied owner UUID/email do not match one active, confirmed PI Auth user.';
  end if;
end;
$preflight$;

select exists (
  select 1 from auth.users
  where id = pg_catalog.current_setting('smkh.bootstrap_owner_user_id')::pg_catalog.uuid
    and pg_catalog.lower(email) = pg_catalog.lower(pg_catalog.current_setting('smkh.bootstrap_owner_email'))
    and deleted_at is null and email_confirmed_at is not null
    and (banned_until is null or banned_until <= pg_catalog.now())
) as verified_pi_owner_auth_match;

select count(*) as existing_non_smkh_public_tables
from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r','p') and c.relname not like 'smkh\_%' escape '\';

select c.relname, c.relrowsecurity, c.relforcerowsecurity,
       pg_catalog.pg_get_userbyid(c.relowner) as owner
from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r','p') and c.relname not like 'smkh\_%' escape '\'
order by c.relname;

select n.nspname as schema_name, count(*) filter (where c.relkind in ('r','p')) as tables
from pg_catalog.pg_namespace n left join pg_catalog.pg_class c on c.relnamespace = n.oid
where n.nspname not like 'pg_temp_%' and n.nspname not like 'pg_toast_temp_%'
group by n.nspname order by n.nspname;

rollback;
