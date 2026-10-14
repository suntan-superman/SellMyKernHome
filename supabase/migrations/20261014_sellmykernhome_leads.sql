-- REVIEW BEFORE APPLYING. Additive seller-lead support for the existing GNZ schema.
-- This file has not been run against production.
begin;

alter table public.gnz_leads
  add column if not exists lead_type text not null default 'investor',
  add column if not exists source_site text not null default 'gnzmarketingllc.com',
  add column if not exists preferred_contact text,
  add column if not exists property_address text,
  add column if not exists property_city text,
  add column if not exists property_zip text,
  add column if not exists property_type text,
  add column if not exists property_condition text,
  add column if not exists occupancy text,
  add column if not exists desired_timing text,
  add column if not exists attribution jsonb not null default '{}'::jsonb,
  add column if not exists consent jsonb not null default '{}'::jsonb,
  add column if not exists assigned_to uuid references auth.users(id) on delete set null;

alter table public.gnz_leads drop constraint if exists gnz_leads_status_check;
alter table public.gnz_leads add constraint gnz_leads_status_check
  check (status in ('new', 'contacted', 'qualified', 'in_discussion', 'closed', 'not_proceeding'));

alter table public.gnz_leads drop constraint if exists gnz_leads_lead_type_check;
alter table public.gnz_leads add constraint gnz_leads_lead_type_check check (lead_type in ('investor', 'seller'));
alter table public.gnz_leads drop constraint if exists gnz_leads_preferred_contact_check;
alter table public.gnz_leads add constraint gnz_leads_preferred_contact_check check (preferred_contact is null or preferred_contact in ('email', 'phone'));

create index if not exists gnz_leads_type_created_idx on public.gnz_leads (lead_type, created_at desc);
create index if not exists gnz_leads_source_site_idx on public.gnz_leads (source_site);

create table if not exists public.smkh_notification_logs (
  id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.gnz_leads(id) on delete cascade,
  channel text not null, status text not null, provider_id text, error_code text, attempted_at timestamptz not null default now()
);
create index if not exists smkh_notification_lead_idx on public.smkh_notification_logs (lead_id, attempted_at desc);

create table if not exists public.smkh_lead_audit (
  id bigint generated always as identity primary key, lead_id uuid not null, action text not null,
  actor_id uuid, before_state jsonb, after_state jsonb, created_at timestamptz not null default now()
);
create index if not exists smkh_lead_audit_lead_idx on public.smkh_lead_audit (lead_id, created_at desc);

create or replace function public.smkh_audit_seller_lead() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(new.lead_type, old.lead_type) = 'seller' then
    insert into public.smkh_lead_audit (lead_id, action, actor_id, before_state, after_state)
    values (
      coalesce(new.id, old.id), tg_op, auth.uid(),
      case when tg_op = 'INSERT' then null else jsonb_build_object('status', old.status, 'assigned_to', old.assigned_to, 'updated_at', old.updated_at) end,
      case when tg_op = 'DELETE' then null else jsonb_build_object('status', new.status, 'assigned_to', new.assigned_to, 'updated_at', new.updated_at) end
    );
  end if;
  return coalesce(new, old);
end; $$;
drop trigger if exists smkh_seller_lead_audit on public.gnz_leads;
create trigger smkh_seller_lead_audit after insert or update or delete on public.gnz_leads for each row execute function public.smkh_audit_seller_lead();

create table if not exists public.smkh_rate_limits (
  identifier_hash text primary key, request_count integer not null default 0, window_started_at timestamptz not null default now()
);
create or replace function public.smkh_check_rate_limit(p_identifier_hash text, p_request_limit integer, p_window_seconds integer)
returns table(allowed boolean, retry_after integer) language plpgsql security definer set search_path = public as $$
declare current_count integer; started timestamptz;
begin
  insert into public.smkh_rate_limits as limits (identifier_hash, request_count, window_started_at)
  values (p_identifier_hash, 1, now())
  on conflict (identifier_hash) do update set
    request_count = case when limits.window_started_at + make_interval(secs => p_window_seconds) <= now() then 1 else limits.request_count + 1 end,
    window_started_at = case when limits.window_started_at + make_interval(secs => p_window_seconds) <= now() then now() else limits.window_started_at end
  returning request_count, window_started_at into current_count, started;
  return query select current_count <= p_request_limit, greatest(0, ceil(extract(epoch from (started + make_interval(secs => p_window_seconds) - now())))::integer);
end; $$;

alter table public.smkh_notification_logs enable row level security;
alter table public.smkh_lead_audit enable row level security;
alter table public.smkh_rate_limits enable row level security;
revoke all on public.smkh_notification_logs, public.smkh_lead_audit, public.smkh_rate_limits from public, anon, authenticated;
revoke execute on function public.smkh_check_rate_limit(text, integer, integer) from public, anon, authenticated;
grant select, insert on public.smkh_notification_logs to service_role;
grant select, insert on public.smkh_lead_audit to service_role;
grant select, insert, update, delete on public.smkh_rate_limits to service_role;
grant execute on function public.smkh_check_rate_limit(text, integer, integer) to service_role;

notify pgrst, 'reload schema';
commit;

