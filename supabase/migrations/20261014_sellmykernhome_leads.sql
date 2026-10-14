-- REVIEW BEFORE APPLYING. Additive seller-lead support for the existing GNZ schema.
-- This file has not been run against production.
begin;

do $preflight$
begin
  if pg_catalog.to_regclass('public.gnz_leads') is null then
    raise exception 'Required table public.gnz_leads is missing.';
  end if;
  if pg_catalog.to_regclass('public.admin_users') is null then
    raise exception 'Required table public.admin_users is missing.';
  end if;
end;
$preflight$;

alter table public.gnz_leads
  add column if not exists lead_type pg_catalog.text not null default 'investor',
  add column if not exists source_site pg_catalog.text not null default 'gnzmarketingllc.com',
  add column if not exists preferred_contact pg_catalog.text,
  add column if not exists property_address pg_catalog.text,
  add column if not exists property_city pg_catalog.text,
  add column if not exists property_zip pg_catalog.text,
  add column if not exists property_type pg_catalog.text,
  add column if not exists property_condition pg_catalog.text,
  add column if not exists occupancy pg_catalog.text,
  add column if not exists desired_timing pg_catalog.text,
  add column if not exists attribution pg_catalog.jsonb not null default '{}'::pg_catalog.jsonb,
  add column if not exists consent pg_catalog.jsonb not null default '{}'::pg_catalog.jsonb,
  add column if not exists assigned_to pg_catalog.uuid references auth.users(id) on delete set null;

alter table public.gnz_leads drop constraint if exists gnz_leads_status_check;
alter table public.gnz_leads add constraint gnz_leads_status_check
  check (status in ('new', 'contacted', 'qualified', 'in_discussion', 'closed', 'not_proceeding'));

alter table public.gnz_leads drop constraint if exists gnz_leads_lead_type_check;
alter table public.gnz_leads add constraint gnz_leads_lead_type_check
  check (lead_type in ('investor', 'seller'));
alter table public.gnz_leads drop constraint if exists gnz_leads_preferred_contact_check;
alter table public.gnz_leads add constraint gnz_leads_preferred_contact_check
  check (preferred_contact is null or preferred_contact in ('email', 'phone'));

create index if not exists gnz_leads_type_created_idx on public.gnz_leads (lead_type, created_at desc);
create index if not exists gnz_leads_source_site_idx on public.gnz_leads (source_site);

create table if not exists public.smkh_notification_logs (
  id pg_catalog.uuid primary key default pg_catalog.gen_random_uuid(),
  lead_id pg_catalog.uuid not null references public.gnz_leads(id) on delete cascade,
  channel pg_catalog.text not null,
  status pg_catalog.text not null,
  provider_id pg_catalog.text,
  error_code pg_catalog.text,
  attempted_at pg_catalog.timestamptz not null default pg_catalog.now()
);
create index if not exists smkh_notification_lead_idx
  on public.smkh_notification_logs (lead_id, attempted_at desc);

create table if not exists public.smkh_lead_audit (
  id pg_catalog.int8 generated always as identity primary key,
  lead_id pg_catalog.uuid not null,
  action pg_catalog.text not null,
  actor_id pg_catalog.uuid,
  actor_kind pg_catalog.text not null default 'system'
    check (actor_kind in ('admin', 'system')),
  before_state pg_catalog.jsonb,
  after_state pg_catalog.jsonb,
  created_at pg_catalog.timestamptz not null default pg_catalog.now()
);
create index if not exists smkh_lead_audit_lead_idx
  on public.smkh_lead_audit (lead_id, created_at desc);

create or replace function public.smkh_audit_seller_lead()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $function$
declare
  actor_setting pg_catalog.text :=
    nullif(pg_catalog.current_setting('smkh.actor_id', true), '');
  verified_actor_id pg_catalog.uuid;
begin
  if actor_setting is not null then
    verified_actor_id := actor_setting::pg_catalog.uuid;
  end if;

  if coalesce(new.lead_type, old.lead_type) = 'seller' then
    insert into public.smkh_lead_audit (
      lead_id, action, actor_id, actor_kind, before_state, after_state
    )
    values (
      coalesce(new.id, old.id),
      tg_op,
      verified_actor_id,
      case when verified_actor_id is null then 'system' else 'admin' end,
      case when tg_op = 'INSERT' then null else pg_catalog.jsonb_build_object(
        'status', old.status,
        'assigned_to', old.assigned_to,
        'updated_at', old.updated_at
      ) end,
      case when tg_op = 'DELETE' then null else pg_catalog.jsonb_build_object(
        'status', new.status,
        'assigned_to', new.assigned_to,
        'updated_at', new.updated_at
      ) end
    );
  end if;
  return coalesce(new, old);
end;
$function$;

drop trigger if exists smkh_seller_lead_audit on public.gnz_leads;
create trigger smkh_seller_lead_audit
after insert or update or delete on public.gnz_leads
for each row execute function public.smkh_audit_seller_lead();

create table if not exists public.smkh_rate_limits (
  identifier_hash pg_catalog.text primary key,
  request_count pg_catalog.int4 not null default 0,
  window_started_at pg_catalog.timestamptz not null default pg_catalog.now()
);

create or replace function public.smkh_check_rate_limit(
  p_identifier_hash pg_catalog.text,
  p_request_limit pg_catalog.int4,
  p_window_seconds pg_catalog.int4
)
returns table(allowed pg_catalog.bool, retry_after pg_catalog.int4)
language plpgsql
security definer
set search_path = pg_catalog
as $function$
declare
  current_count pg_catalog.int4;
  started pg_catalog.timestamptz;
begin
  if p_request_limit < 1 or p_window_seconds < 1 then
    raise exception using errcode = '22023', message = 'Rate-limit values must be positive.';
  end if;

  insert into public.smkh_rate_limits as limits (
    identifier_hash, request_count, window_started_at
  )
  values (p_identifier_hash, 1, pg_catalog.now())
  on conflict (identifier_hash) do update set
    request_count = case
      when limits.window_started_at + pg_catalog.make_interval(secs => p_window_seconds) <= pg_catalog.now()
        then 1
      else limits.request_count + 1
    end,
    window_started_at = case
      when limits.window_started_at + pg_catalog.make_interval(secs => p_window_seconds) <= pg_catalog.now()
        then pg_catalog.now()
      else limits.window_started_at
    end
  returning request_count, window_started_at into current_count, started;

  return query select
    current_count <= p_request_limit,
    greatest(
      0,
      pg_catalog.ceil(
        pg_catalog.date_part(
          'epoch',
          (
            started
            + pg_catalog.make_interval(secs => p_window_seconds)
            - pg_catalog.now()
          )
        )
      )::pg_catalog.int4
    );
end;
$function$;

-- Human Admin mutations use this service-role-only RPC. The caller passes the
-- identity obtained from the authenticated server session, and the function
-- independently verifies membership before setting transaction-local context.
create or replace function public.smkh_admin_update_lead(
  p_lead_id pg_catalog.uuid,
  p_status pg_catalog.text,
  p_internal_notes pg_catalog.text,
  p_assigned_to pg_catalog.uuid,
  p_actor_id pg_catalog.uuid
)
returns setof public.gnz_leads
language plpgsql
security definer
set search_path = pg_catalog
as $function$
begin
  if p_actor_id is null or not exists (
    select 1 from public.admin_users where user_id = p_actor_id
  ) then
    raise exception using errcode = '42501', message = 'Verified GNZ Admin membership is required.';
  end if;

  if p_assigned_to is not null and not exists (
    select 1 from public.admin_users where user_id = p_assigned_to
  ) then
    raise exception using errcode = '22023', message = 'The assignee is not an authorized GNZ administrator.';
  end if;

  if p_status is null or p_status not in (
    'new', 'contacted', 'qualified', 'in_discussion', 'closed', 'not_proceeding'
  ) then
    raise exception using errcode = '22023', message = 'The lead status is not valid.';
  end if;

  perform pg_catalog.set_config('smkh.actor_id', p_actor_id::pg_catalog.text, true);

  return query
    update public.gnz_leads
    set
      status = p_status,
      internal_notes = coalesce(p_internal_notes, ''),
      assigned_to = p_assigned_to
    where id = p_lead_id
    returning *;
end;
$function$;

-- Reassert the existing GNZ deny-by-default posture so this migration is
-- secure even if privileges have drifted since the original GNZ migration.
alter table public.gnz_leads enable row level security;
alter table public.smkh_notification_logs enable row level security;
alter table public.smkh_lead_audit enable row level security;
alter table public.smkh_rate_limits enable row level security;

revoke all on public.gnz_leads from public, anon, authenticated;
revoke all on public.smkh_notification_logs, public.smkh_lead_audit, public.smkh_rate_limits
  from public, anon, authenticated;

-- Reset drifted service-role ACLs before restoring the minimum operations used
-- by the GNZ and SellMyKernHome server clients. In particular, this removes a
-- pre-existing DELETE (and any other excess table privilege) without relying
-- on the table currently being empty.
revoke all privileges on table public.gnz_leads from service_role;
grant select, insert, update on table public.gnz_leads to service_role;
grant select, insert on public.smkh_notification_logs to service_role;
grant select, insert on public.smkh_lead_audit to service_role;
grant select, insert, update, delete on public.smkh_rate_limits to service_role;

revoke all on function public.smkh_audit_seller_lead()
  from public, anon, authenticated, service_role;
revoke all on function public.smkh_check_rate_limit(pg_catalog.text, pg_catalog.int4, pg_catalog.int4)
  from public, anon, authenticated;
revoke all on function public.smkh_admin_update_lead(
  pg_catalog.uuid, pg_catalog.text, pg_catalog.text, pg_catalog.uuid, pg_catalog.uuid
) from public, anon, authenticated;

grant execute on function public.smkh_check_rate_limit(
  pg_catalog.text, pg_catalog.int4, pg_catalog.int4
) to service_role;
grant execute on function public.smkh_admin_update_lead(
  pg_catalog.uuid, pg_catalog.text, pg_catalog.text, pg_catalog.uuid, pg_catalog.uuid
) to service_role;

notify pgrst, 'reload schema';
commit;
