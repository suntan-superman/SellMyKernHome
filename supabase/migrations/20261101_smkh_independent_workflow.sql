-- Additive production migration for an independent Sell My Kern Home workflow.
-- This migration copies SMKH seller records and memberships without deleting or
-- updating any GNZ table, record, privilege, function, trigger, or auth user.
begin;

do $preflight$
begin
  if pg_catalog.to_regclass('public.gnz_leads') is null then
    raise exception 'Required source table public.gnz_leads is missing.';
  end if;
  if pg_catalog.to_regclass('public.admin_users') is null then
    raise exception 'Required source table public.admin_users is missing.';
  end if;
  if pg_catalog.to_regclass('public.smkh_lead_audit') is null
    or pg_catalog.to_regclass('public.smkh_notification_logs') is null
    or pg_catalog.to_regclass('public.smkh_rate_limits') is null then
    raise exception 'The verified 20261014 SMKH support objects are missing.';
  end if;
  if exists (
    select 1 from public.gnz_leads
    where (lead_type = 'seller' or source_site = 'sellmykernhome.com')
      and (
        reference is null or submission_token is null or first_name is null
        or preferred_contact is null or preferred_contact not in ('email', 'phone')
        or property_address is null or property_address = ''
        or property_city is null or property_city = ''
        or property_zip is null or property_zip = ''
        or attribution is null or consent is null
      )
  ) then
    raise exception 'A source seller row is missing a value required by the independent SMKH schema.';
  end if;
end;
$preflight$;

create table if not exists public.smkh_admin_memberships (
  user_id pg_catalog.uuid primary key references auth.users(id) on delete cascade,
  display_name pg_catalog.text not null,
  role pg_catalog.text not null default 'admin'
    check (role in ('owner', 'admin', 'operator', 'viewer')),
  active pg_catalog.bool not null default true,
  created_at pg_catalog.timestamptz not null default pg_catalog.now(),
  updated_at pg_catalog.timestamptz not null default pg_catalog.now()
);

insert into public.smkh_admin_memberships (user_id, display_name, role, active, created_at, updated_at)
select user_id, display_name, 'admin', true, created_at, pg_catalog.now()
from public.admin_users
on conflict (user_id) do nothing;

create table if not exists public.smkh_leads (
  id pg_catalog.uuid primary key default pg_catalog.gen_random_uuid(),
  reference pg_catalog.text not null unique,
  submission_token pg_catalog.uuid not null unique,
  source pg_catalog.text not null default 'seller_web',
  source_site pg_catalog.text not null default 'sellmykernhome.com',
  lead_type pg_catalog.text not null default 'seller' check (lead_type = 'seller'),
  created_at pg_catalog.timestamptz not null default pg_catalog.now(),
  updated_at pg_catalog.timestamptz not null default pg_catalog.now(),
  first_name pg_catalog.text not null,
  last_name pg_catalog.text not null default '',
  company_name pg_catalog.text not null default '',
  phone pg_catalog.text not null default '',
  email pg_catalog.text not null default '',
  preferred_contact pg_catalog.text not null check (preferred_contact in ('email', 'phone')),
  service pg_catalog.text not null default 'seller-property',
  message pg_catalog.text not null default '',
  property_address pg_catalog.text not null,
  property_city pg_catalog.text not null,
  property_zip pg_catalog.text not null,
  property_type pg_catalog.text,
  property_condition pg_catalog.text,
  occupancy pg_catalog.text,
  desired_timing pg_catalog.text,
  attribution pg_catalog.jsonb not null default '{}'::pg_catalog.jsonb,
  consent pg_catalog.jsonb not null default '{}'::pg_catalog.jsonb,
  status pg_catalog.text not null default 'new'
    check (status in ('new', 'contacted', 'qualified', 'appointment', 'offer_made', 'under_contract', 'closed', 'lost')),
  assigned_to pg_catalog.uuid references public.smkh_admin_memberships(user_id) on delete set null,
  internal_notes pg_catalog.text not null default '',
  follow_up_at pg_catalog.timestamptz,
  last_contacted_at pg_catalog.timestamptz,
  archived_at pg_catalog.timestamptz,
  archived_by pg_catalog.uuid,
  legacy_gnz_lead_id pg_catalog.uuid unique,
  legacy_status pg_catalog.text
);

create index if not exists smkh_leads_status_created_idx
  on public.smkh_leads (status, created_at desc);
create index if not exists smkh_leads_follow_up_idx
  on public.smkh_leads (follow_up_at) where follow_up_at is not null;
create index if not exists smkh_leads_assigned_idx
  on public.smkh_leads (assigned_to, created_at desc);
create index if not exists smkh_leads_source_created_idx
  on public.smkh_leads (source, created_at desc);

drop trigger if exists smkh_independent_lead_audit on public.smkh_leads;

insert into public.smkh_leads (
  id, reference, submission_token, source, source_site, lead_type,
  created_at, updated_at, first_name, last_name, company_name, phone, email,
  preferred_contact, service, message, property_address, property_city,
  property_zip, property_type, property_condition, occupancy, desired_timing,
  attribution, consent, status, assigned_to, internal_notes, archived_at,
  archived_by, legacy_gnz_lead_id, legacy_status
)
select
  g.id, g.reference, g.submission_token, g.source, 'sellmykernhome.com', 'seller',
  g.created_at, g.updated_at, g.first_name, g.last_name, g.company_name,
  g.phone, g.email, g.preferred_contact, g.service, g.message,
  g.property_address, g.property_city, g.property_zip, g.property_type,
  g.property_condition, g.occupancy, g.desired_timing, g.attribution, g.consent,
  case
    when g.status in ('new', 'contacted', 'qualified', 'appointment', 'offer_made', 'under_contract', 'closed', 'lost') then g.status
    when g.status = 'in_discussion' then 'contacted'
    when g.status = 'offer_sent' then 'offer_made'
    when g.status = 'purchased' then 'closed'
    when g.status = 'archived' then 'lost'
    else 'new'
  end,
  case when m.user_id is not null then g.assigned_to else null end,
  g.internal_notes, g.archived_at, g.archived_by, g.id, g.status
from public.gnz_leads as g
left join public.smkh_admin_memberships as m on m.user_id = g.assigned_to
where g.lead_type = 'seller' or g.source_site = 'sellmykernhome.com'
on conflict (id) do nothing;

create table if not exists public.smkh_lead_events (
  id pg_catalog.int8 generated always as identity primary key,
  lead_id pg_catalog.uuid not null references public.smkh_leads(id) on delete restrict,
  action pg_catalog.text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  actor_id pg_catalog.uuid,
  actor_kind pg_catalog.text not null check (actor_kind in ('admin', 'system', 'migration')),
  before_state pg_catalog.jsonb,
  after_state pg_catalog.jsonb,
  created_at pg_catalog.timestamptz not null default pg_catalog.now(),
  legacy_audit_id pg_catalog.int8 unique
);
create index if not exists smkh_lead_events_lead_idx
  on public.smkh_lead_events (lead_id, created_at desc);

insert into public.smkh_lead_events (
  lead_id, action, actor_id, actor_kind, before_state, after_state, created_at, legacy_audit_id
)
select
  a.lead_id, a.action, a.actor_id,
  case when a.actor_kind = 'admin' then 'admin' else 'system' end,
  a.before_state, a.after_state, a.created_at, a.id
from public.smkh_lead_audit as a
join public.smkh_leads as l on l.id = a.lead_id
on conflict (legacy_audit_id) do nothing;

insert into public.smkh_lead_events (lead_id, action, actor_kind, after_state)
select l.id, 'INSERT', 'migration', pg_catalog.jsonb_build_object(
  'status', l.status,
  'legacy_status', l.legacy_status,
  'source', 'gnz_preservation_copy'
)
from public.smkh_leads as l
where l.legacy_gnz_lead_id is not null
  and not exists (
    select 1 from public.smkh_lead_events as e
    where e.lead_id = l.id and e.actor_kind = 'migration'
  );

create table if not exists public.smkh_notifications (
  id pg_catalog.uuid primary key default pg_catalog.gen_random_uuid(),
  lead_id pg_catalog.uuid not null references public.smkh_leads(id) on delete restrict,
  channel pg_catalog.text not null check (channel = 'email'),
  status pg_catalog.text not null,
  provider_id pg_catalog.text,
  error_code pg_catalog.text,
  attempted_at pg_catalog.timestamptz not null default pg_catalog.now(),
  legacy_notification_id pg_catalog.uuid unique
);
create index if not exists smkh_notifications_lead_idx
  on public.smkh_notifications (lead_id, attempted_at desc);

insert into public.smkh_notifications (
  id, lead_id, channel, status, provider_id, error_code, attempted_at, legacy_notification_id
)
select n.id, n.lead_id, n.channel, n.status, n.provider_id, n.error_code, n.attempted_at, n.id
from public.smkh_notification_logs as n
join public.smkh_leads as l on l.id = n.lead_id
on conflict (id) do nothing;

create or replace function public.smkh_audit_independent_lead()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $function$
declare
  actor_setting pg_catalog.text := nullif(pg_catalog.current_setting('smkh.actor_id', true), '');
  kind_setting pg_catalog.text := nullif(pg_catalog.current_setting('smkh.actor_kind', true), '');
  verified_actor_id pg_catalog.uuid;
  verified_kind pg_catalog.text;
begin
  if actor_setting is not null then
    verified_actor_id := actor_setting::pg_catalog.uuid;
  end if;
  verified_kind := case
    when verified_actor_id is not null then 'admin'
    when kind_setting = 'migration' then 'migration'
    else 'system'
  end;

  insert into public.smkh_lead_events (
    lead_id, action, actor_id, actor_kind, before_state, after_state
  ) values (
    new.id, tg_op, verified_actor_id, verified_kind,
    case when tg_op = 'INSERT' then null else pg_catalog.jsonb_build_object(
      'status', old.status,
      'follow_up_at', old.follow_up_at,
      'last_contacted_at', old.last_contacted_at,
      'notes_changed', false,
      'updated_at', old.updated_at
    ) end,
    pg_catalog.jsonb_build_object(
      'status', new.status,
      'follow_up_at', new.follow_up_at,
      'last_contacted_at', new.last_contacted_at,
      'notes_changed', case when tg_op = 'INSERT' then new.internal_notes <> '' else new.internal_notes is distinct from old.internal_notes end,
      'updated_at', new.updated_at
    )
  );
  return new;
end;
$function$;

create trigger smkh_independent_lead_audit
after insert or update on public.smkh_leads
for each row execute function public.smkh_audit_independent_lead();

create or replace function public.smkh_update_lead(
  p_lead_id pg_catalog.uuid,
  p_status pg_catalog.text,
  p_internal_notes pg_catalog.text,
  p_follow_up_at pg_catalog.timestamptz,
  p_last_contacted_at pg_catalog.timestamptz
)
returns setof public.smkh_leads
language plpgsql
security definer
set search_path = pg_catalog
as $function$
declare
  verified_actor_id pg_catalog.uuid := auth.uid();
begin
  if verified_actor_id is null or not exists (
    select 1 from public.smkh_admin_memberships
    where user_id = verified_actor_id and active and role in ('owner', 'admin', 'operator')
  ) then
    raise exception using errcode = '42501', message = 'Active SMKH operator membership is required.';
  end if;

  if p_status is null or p_status not in (
    'new', 'contacted', 'qualified', 'appointment', 'offer_made', 'under_contract', 'closed', 'lost'
  ) then
    raise exception using errcode = '22023', message = 'The lead status is not valid.';
  end if;

  if pg_catalog.length(coalesce(p_internal_notes, '')) > 10000 then
    raise exception using errcode = '22023', message = 'Internal notes exceed the allowed length.';
  end if;

  perform pg_catalog.set_config('smkh.actor_id', verified_actor_id::pg_catalog.text, true);
  perform pg_catalog.set_config('smkh.actor_kind', 'admin', true);

  return query
  update public.smkh_leads
  set status = p_status,
      internal_notes = coalesce(p_internal_notes, ''),
      follow_up_at = p_follow_up_at,
      last_contacted_at = p_last_contacted_at,
      updated_at = pg_catalog.now()
  where id = p_lead_id
  returning *;
end;
$function$;

alter table public.smkh_admin_memberships enable row level security;
alter table public.smkh_leads enable row level security;
alter table public.smkh_lead_events enable row level security;
alter table public.smkh_notifications enable row level security;

drop policy if exists smkh_membership_self_read on public.smkh_admin_memberships;
create policy smkh_membership_self_read on public.smkh_admin_memberships
  for select to authenticated using (user_id = auth.uid());
drop policy if exists smkh_member_lead_read on public.smkh_leads;
create policy smkh_member_lead_read on public.smkh_leads
  for select to authenticated using (exists (
    select 1 from public.smkh_admin_memberships
    where user_id = auth.uid() and active
  ));
drop policy if exists smkh_member_event_read on public.smkh_lead_events;
create policy smkh_member_event_read on public.smkh_lead_events
  for select to authenticated using (exists (
    select 1 from public.smkh_admin_memberships
    where user_id = auth.uid() and active
  ));
drop policy if exists smkh_member_notification_read on public.smkh_notifications;
create policy smkh_member_notification_read on public.smkh_notifications
  for select to authenticated using (exists (
    select 1 from public.smkh_admin_memberships
    where user_id = auth.uid() and active
  ));

revoke all on public.smkh_admin_memberships, public.smkh_leads,
  public.smkh_lead_events, public.smkh_notifications from public, anon, authenticated, service_role;
grant select on public.smkh_admin_memberships, public.smkh_leads,
  public.smkh_lead_events, public.smkh_notifications to authenticated;
grant select on public.smkh_admin_memberships to service_role;
grant select, insert on public.smkh_leads to service_role;
grant select on public.smkh_lead_events to service_role;
grant select, insert on public.smkh_notifications to service_role;

revoke all on function public.smkh_audit_independent_lead() from public, anon, authenticated, service_role;
revoke all on function public.smkh_update_lead(
  pg_catalog.uuid, pg_catalog.text, pg_catalog.text, pg_catalog.timestamptz, pg_catalog.timestamptz
) from public, anon, authenticated, service_role;
grant execute on function public.smkh_update_lead(
  pg_catalog.uuid, pg_catalog.text, pg_catalog.text, pg_catalog.timestamptz, pg_catalog.timestamptz
) to authenticated;

comment on table public.smkh_leads is 'Independent Sell My Kern Home seller leads. Historical GNZ source records remain unchanged.';
comment on table public.smkh_admin_memberships is 'Independent SMKH authorization memberships backed by the existing Supabase Auth tenant.';
comment on table public.smkh_lead_events is 'Independent SMKH audit history with human, system, and migration attribution.';

notify pgrst, 'reload schema';
commit;
