-- Additive Sell My Kern Home schema for the existing PropertyIntelligence project.
-- Existing PropertyIntelligence objects are not read or modified. Operational tables start empty.
-- The execution session must provide a verified PI Auth UUID, matching email,
-- and display name through the smkh.bootstrap_owner_* settings.
begin;

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
  if not pg_catalog.pg_has_role(current_user, 'postgres', 'member')
     and current_user <> 'postgres' then
    raise exception 'Migration must run through the verified PropertyIntelligence database owner connection.';
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
  begin
    owner_id := owner_id_text::pg_catalog.uuid;
  exception when invalid_text_representation then
    raise exception 'The verified PI owner Auth user ID is not a valid UUID.';
  end;
  if pg_catalog.length(owner_display_name) > 120 then
    raise exception 'The owner display name exceeds 120 characters.';
  end if;
  if not exists (
    select 1 from auth.users
    where id = owner_id
      and pg_catalog.lower(email) = pg_catalog.lower(owner_email)
      and deleted_at is null
      and email_confirmed_at is not null
      and (banned_until is null or banned_until <= pg_catalog.now())
  ) then
    raise exception 'The supplied owner UUID/email do not match one active, confirmed PI Auth user.';
  end if;
end;
$preflight$;

create table public.smkh_admin_memberships (
  user_id pg_catalog.uuid primary key references auth.users(id) on delete restrict,
  display_name pg_catalog.text not null,
  role pg_catalog.text not null default 'admin'
    check (role in ('owner', 'admin', 'operator', 'viewer')),
  active pg_catalog.bool not null default true,
  created_at pg_catalog.timestamptz not null default pg_catalog.now(),
  updated_at pg_catalog.timestamptz not null default pg_catalog.now()
);

insert into public.smkh_admin_memberships (user_id, display_name, role, active)
values (
  pg_catalog.current_setting('smkh.bootstrap_owner_user_id')::pg_catalog.uuid,
  pg_catalog.current_setting('smkh.bootstrap_owner_display_name'),
  'owner', true
);

create table public.smkh_leads (
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
  archived_by pg_catalog.uuid
);

create index smkh_leads_status_created_idx on public.smkh_leads (status, created_at desc);
create index smkh_leads_follow_up_idx on public.smkh_leads (follow_up_at) where follow_up_at is not null;
create index smkh_leads_assigned_idx on public.smkh_leads (assigned_to, created_at desc);
create index smkh_leads_source_created_idx on public.smkh_leads (source, created_at desc);

create table public.smkh_lead_events (
  id pg_catalog.int8 generated always as identity primary key,
  lead_id pg_catalog.uuid not null references public.smkh_leads(id) on delete restrict,
  action pg_catalog.text not null check (action in ('INSERT', 'UPDATE')),
  actor_id pg_catalog.uuid,
  actor_kind pg_catalog.text not null check (actor_kind in ('admin', 'system')),
  before_state pg_catalog.jsonb,
  after_state pg_catalog.jsonb,
  created_at pg_catalog.timestamptz not null default pg_catalog.now()
);
create index smkh_lead_events_lead_idx on public.smkh_lead_events (lead_id, created_at desc);

create table public.smkh_notifications (
  id pg_catalog.uuid primary key default pg_catalog.gen_random_uuid(),
  lead_id pg_catalog.uuid not null references public.smkh_leads(id) on delete restrict,
  channel pg_catalog.text not null check (channel = 'email'),
  status pg_catalog.text not null,
  provider_id pg_catalog.text,
  error_code pg_catalog.text,
  attempted_at pg_catalog.timestamptz not null default pg_catalog.now()
);
create index smkh_notifications_lead_idx on public.smkh_notifications (lead_id, attempted_at desc);

create table public.smkh_rate_limits (
  identifier_hash pg_catalog.text primary key,
  request_count pg_catalog.int4 not null default 0,
  window_started_at pg_catalog.timestamptz not null default pg_catalog.now()
);

create function public.smkh_audit_independent_lead()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $function$
declare
  actor_setting pg_catalog.text := nullif(pg_catalog.current_setting('smkh.actor_id', true), '');
  verified_actor_id pg_catalog.uuid;
begin
  if actor_setting is not null then
    verified_actor_id := actor_setting::pg_catalog.uuid;
  end if;
  insert into public.smkh_lead_events (lead_id, action, actor_id, actor_kind, before_state, after_state)
  values (
    new.id, tg_op, verified_actor_id,
    case when verified_actor_id is null then 'system' else 'admin' end,
    case when tg_op = 'INSERT' then null else pg_catalog.jsonb_build_object(
      'status', old.status, 'follow_up_at', old.follow_up_at,
      'last_contacted_at', old.last_contacted_at, 'notes_changed', false,
      'updated_at', old.updated_at
    ) end,
    pg_catalog.jsonb_build_object(
      'status', new.status, 'follow_up_at', new.follow_up_at,
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

create function public.smkh_update_lead(
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
  if p_status is null or p_status not in ('new','contacted','qualified','appointment','offer_made','under_contract','closed','lost') then
    raise exception using errcode = '22023', message = 'The lead status is not valid.';
  end if;
  if pg_catalog.length(coalesce(p_internal_notes, '')) > 10000 then
    raise exception using errcode = '22023', message = 'Internal notes exceed the allowed length.';
  end if;
  perform pg_catalog.set_config('smkh.actor_id', verified_actor_id::pg_catalog.text, true);
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

create function public.smkh_check_rate_limit(
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
  insert into public.smkh_rate_limits as limits (identifier_hash, request_count, window_started_at)
  values (p_identifier_hash, 1, pg_catalog.now())
  on conflict (identifier_hash) do update set
    request_count = case when limits.window_started_at + pg_catalog.make_interval(secs => p_window_seconds) <= pg_catalog.now() then 1 else limits.request_count + 1 end,
    window_started_at = case when limits.window_started_at + pg_catalog.make_interval(secs => p_window_seconds) <= pg_catalog.now() then pg_catalog.now() else limits.window_started_at end
  returning request_count, window_started_at into current_count, started;
  return query select
    current_count <= p_request_limit,
    greatest(0, pg_catalog.ceil(pg_catalog.date_part('epoch', started + pg_catalog.make_interval(secs => p_window_seconds) - pg_catalog.now()))::pg_catalog.int4);
end;
$function$;

alter table public.smkh_admin_memberships enable row level security;
alter table public.smkh_leads enable row level security;
alter table public.smkh_lead_events enable row level security;
alter table public.smkh_notifications enable row level security;
alter table public.smkh_rate_limits enable row level security;

create policy smkh_membership_self_read on public.smkh_admin_memberships
  for select to authenticated using (user_id = auth.uid());
create policy smkh_member_lead_read on public.smkh_leads
  for select to authenticated using (exists (select 1 from public.smkh_admin_memberships where user_id = auth.uid() and active));
create policy smkh_member_event_read on public.smkh_lead_events
  for select to authenticated using (exists (select 1 from public.smkh_admin_memberships where user_id = auth.uid() and active));
create policy smkh_member_notification_read on public.smkh_notifications
  for select to authenticated using (exists (select 1 from public.smkh_admin_memberships where user_id = auth.uid() and active));

revoke all on public.smkh_admin_memberships, public.smkh_leads, public.smkh_lead_events,
  public.smkh_notifications, public.smkh_rate_limits from public, anon, authenticated, service_role;
grant select on public.smkh_admin_memberships, public.smkh_leads, public.smkh_lead_events, public.smkh_notifications to authenticated;
grant select on public.smkh_admin_memberships to service_role;
grant select, insert on public.smkh_leads to service_role;
grant select on public.smkh_lead_events to service_role;
grant select, insert on public.smkh_notifications to service_role;

revoke all on function public.smkh_audit_independent_lead() from public, anon, authenticated, service_role;
revoke all on function public.smkh_update_lead(pg_catalog.uuid,pg_catalog.text,pg_catalog.text,pg_catalog.timestamptz,pg_catalog.timestamptz) from public, anon, authenticated, service_role;
revoke all on function public.smkh_check_rate_limit(pg_catalog.text,pg_catalog.int4,pg_catalog.int4) from public, anon, authenticated, service_role;
grant execute on function public.smkh_update_lead(pg_catalog.uuid,pg_catalog.text,pg_catalog.text,pg_catalog.timestamptz,pg_catalog.timestamptz) to authenticated;
grant execute on function public.smkh_check_rate_limit(pg_catalog.text,pg_catalog.int4,pg_catalog.int4) to service_role;

comment on table public.smkh_leads is 'Independent Sell My Kern Home seller leads hosted by PropertyIntelligence; initialized empty.';
comment on table public.smkh_admin_memberships is 'Independent SMKH authorization memberships backed by PropertyIntelligence Supabase Auth.';
comment on table public.smkh_lead_events is 'Independent SMKH audit history with human and system attribution.';

notify pgrst, 'reload schema';
commit;
