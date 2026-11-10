begin;

do $preflight$
begin
  if pg_catalog.to_regclass('public.smkh_privacy_requests') is not null
     or pg_catalog.to_regclass('public.smkh_sharing_suppressions') is not null
     or pg_catalog.to_regprocedure('public.smkh_create_privacy_request(pg_catalog.uuid,pg_catalog.text,pg_catalog.text,pg_catalog.text,pg_catalog.text,pg_catalog.text[],pg_catalog.text,pg_catalog.text)') is not null
     or pg_catalog.to_regprocedure('public.smkh_is_sharing_suppressed(pg_catalog.text[])') is not null then
    raise exception 'SMKH privacy-choice object collision; migration stopped.';
  end if;
  if pg_catalog.to_regclass('public.smkh_leads') is null
     or pg_catalog.to_regclass('public.smkh_admin_memberships') is null then
    raise exception 'Certified independent SMKH schema is missing; migration stopped.';
  end if;
end;
$preflight$;

create table public.smkh_privacy_requests (
  id pg_catalog.uuid primary key default pg_catalog.gen_random_uuid(),
  request_reference pg_catalog.text not null unique,
  request_token pg_catalog.uuid not null unique,
  request_type pg_catalog.text not null
    check (request_type in ('do_not_sell_or_share')),
  email pg_catalog.text not null default '',
  phone pg_catalog.text not null default '',
  identifier_hashes pg_catalog.text[] not null default '{}'::pg_catalog.text[],
  notice_version pg_catalog.text not null,
  notice_sha256 pg_catalog.text not null,
  status pg_catalog.text not null default 'pending'
    check (status in ('pending', 'verified', 'completed', 'rejected')),
  suppression_active pg_catalog.bool not null default true,
  matched_lead_count pg_catalog.int4 not null default 0,
  prior_disclosure_follow_up_required pg_catalog.bool not null default false,
  requested_at pg_catalog.timestamptz not null default pg_catalog.now(),
  updated_at pg_catalog.timestamptz not null default pg_catalog.now(),
  resolved_at pg_catalog.timestamptz,
  resolved_by pg_catalog.uuid references public.smkh_admin_memberships(user_id) on delete set null,
  internal_notes pg_catalog.text not null default '',
  check (email <> '' or phone <> ''),
  check (pg_catalog.array_length(identifier_hashes, 1) >= 1),
  check (notice_sha256 ~ '^[0-9a-f]{64}$')
);

create table public.smkh_sharing_suppressions (
  identifier_hash pg_catalog.text primary key,
  privacy_request_id pg_catalog.uuid not null references public.smkh_privacy_requests(id) on delete restrict,
  active pg_catalog.bool not null default true,
  created_at pg_catalog.timestamptz not null default pg_catalog.now(),
  updated_at pg_catalog.timestamptz not null default pg_catalog.now(),
  check (identifier_hash ~ '^[0-9a-f]{64}$')
);

create index smkh_privacy_requests_status_idx
  on public.smkh_privacy_requests (status, requested_at desc);
create index smkh_privacy_requests_requested_idx
  on public.smkh_privacy_requests (requested_at desc);

create function public.smkh_is_sharing_suppressed(p_identifier_hashes pg_catalog.text[])
returns pg_catalog.bool
language sql
stable
security definer
set search_path = pg_catalog
as $function$
  select exists (
    select 1
    from public.smkh_sharing_suppressions suppressions
    where suppressions.active
      and suppressions.identifier_hash = any(coalesce(p_identifier_hashes, '{}'::pg_catalog.text[]))
  );
$function$;

create function public.smkh_create_privacy_request(
  p_request_token pg_catalog.uuid,
  p_request_reference pg_catalog.text,
  p_request_type pg_catalog.text,
  p_email pg_catalog.text,
  p_phone pg_catalog.text,
  p_identifier_hashes pg_catalog.text[],
  p_notice_version pg_catalog.text,
  p_notice_sha256 pg_catalog.text
)
returns table(request_reference pg_catalog.text, duplicate pg_catalog.bool, matched_lead_count pg_catalog.int4)
language plpgsql
security definer
set search_path = pg_catalog
as $function$
declare
  v_request_id pg_catalog.uuid;
  v_reference pg_catalog.text;
  v_email pg_catalog.text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_email, '')));
  v_phone pg_catalog.text := pg_catalog.regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_matched pg_catalog.int4 := 0;
begin
  if p_request_token is null
     or pg_catalog.btrim(coalesce(p_request_reference, '')) = ''
     or p_request_type <> 'do_not_sell_or_share'
     or (v_email = '' and v_phone = '')
     or pg_catalog.btrim(coalesce(p_notice_version, '')) = ''
     or coalesce(p_notice_sha256, '') !~ '^[0-9a-f]{64}$'
     or not exists (
       select 1 from pg_catalog.unnest(coalesce(p_identifier_hashes, '{}'::pg_catalog.text[])) value
       where value ~ '^[0-9a-f]{64}$'
     ) then
    raise exception 'Valid privacy request evidence is required.';
  end if;

  select requests.id, requests.request_reference, requests.matched_lead_count
    into v_request_id, v_reference, v_matched
  from public.smkh_privacy_requests requests
  where requests.request_token = p_request_token;
  if found then
    return query select v_reference, true, v_matched;
    return;
  end if;

  insert into public.smkh_privacy_requests (
    request_reference, request_token, request_type, email, phone,
    identifier_hashes, notice_version, notice_sha256
  ) values (
    pg_catalog.left(pg_catalog.btrim(p_request_reference), 80), p_request_token,
    p_request_type, v_email, pg_catalog.left(coalesce(p_phone, ''), 30),
    (select pg_catalog.array_agg(distinct value) from pg_catalog.unnest(p_identifier_hashes) value where value ~ '^[0-9a-f]{64}$'),
    pg_catalog.left(pg_catalog.btrim(p_notice_version), 80), p_notice_sha256
  ) returning id, public.smkh_privacy_requests.request_reference
    into v_request_id, v_reference;

  insert into public.smkh_sharing_suppressions (
    identifier_hash, privacy_request_id, active
  )
  select distinct value, v_request_id, true
  from pg_catalog.unnest(p_identifier_hashes) value
  where value ~ '^[0-9a-f]{64}$'
  on conflict (identifier_hash) do update
    set privacy_request_id = excluded.privacy_request_id,
        active = true,
        updated_at = pg_catalog.now();

  update public.smkh_leads leads
  set consent = leads.consent || pg_catalog.jsonb_build_object(
        'external_sharing_opt_out', true,
        'external_sharing_opt_out_at', pg_catalog.now(),
        'external_sharing_consent', false,
        'sharing_suppressed', true,
        'privacy_request_reference', v_reference
      ),
      updated_at = pg_catalog.now()
  where (v_email <> '' and pg_catalog.lower(pg_catalog.btrim(leads.email)) = v_email)
     or (v_phone <> '' and pg_catalog.regexp_replace(leads.phone, '[^0-9]', '', 'g') = v_phone);
  get diagnostics v_matched = row_count;

  update public.smkh_privacy_requests
  set matched_lead_count = v_matched,
      updated_at = pg_catalog.now()
  where id = v_request_id;

  return query select v_reference, false, v_matched;
end;
$function$;

alter table public.smkh_privacy_requests enable row level security;
alter table public.smkh_sharing_suppressions enable row level security;

create policy smkh_member_privacy_request_read on public.smkh_privacy_requests
  for select to authenticated
  using (exists (
    select 1 from public.smkh_admin_memberships memberships
    where memberships.user_id = auth.uid() and memberships.active
  ));
create policy smkh_member_suppression_read on public.smkh_sharing_suppressions
  for select to authenticated
  using (exists (
    select 1 from public.smkh_admin_memberships memberships
    where memberships.user_id = auth.uid() and memberships.active
  ));

revoke all on public.smkh_privacy_requests, public.smkh_sharing_suppressions
  from public, anon, authenticated, service_role;
grant select on public.smkh_privacy_requests, public.smkh_sharing_suppressions
  to authenticated;

revoke all on function public.smkh_is_sharing_suppressed(pg_catalog.text[])
  from public, anon, authenticated, service_role;
revoke all on function public.smkh_create_privacy_request(pg_catalog.uuid,pg_catalog.text,pg_catalog.text,pg_catalog.text,pg_catalog.text,pg_catalog.text[],pg_catalog.text,pg_catalog.text)
  from public, anon, authenticated, service_role;
grant execute on function public.smkh_is_sharing_suppressed(pg_catalog.text[])
  to service_role;
grant execute on function public.smkh_create_privacy_request(pg_catalog.uuid,pg_catalog.text,pg_catalog.text,pg_catalog.text,pg_catalog.text,pg_catalog.text[],pg_catalog.text,pg_catalog.text)
  to service_role;

comment on table public.smkh_privacy_requests is
  'Restricted SMKH privacy-choice evidence and operational request tracking.';
comment on table public.smkh_sharing_suppressions is
  'HMAC-based suppression identifiers that block future SMKH external transfers.';

notify pgrst, 'reload schema';
commit;
