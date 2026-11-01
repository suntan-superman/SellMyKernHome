-- OPTIONAL SYNTHETIC SEED. Apply only after 20261101_adam_demo.sql in isolated staging.
begin;

do $preflight$
begin
  if pg_catalog.current_setting('smkh.environment', true) is distinct from 'staging' then
    raise exception 'Adam demo seed blocked: smkh.environment must equal staging.';
  end if;
  if pg_catalog.to_regclass('public.gnz_leads') is not null
    or pg_catalog.to_regclass('public.admin_users') is not null then
    raise exception 'Adam demo seed blocked: GNZ tables exist in this project.';
  end if;
  if pg_catalog.to_regclass('public.smkh_leads') is null then
    raise exception 'Adam demo seed blocked: independent SMKH schema is missing.';
  end if;
end;
$preflight$;

insert into public.smkh_leads (
  id, reference, submission_token, source, source_site, lead_type,
  first_name, last_name, phone, email, preferred_contact, service, message,
  property_address, property_city, property_zip, property_type,
  property_condition, occupancy, desired_timing, attribution, consent, status,
  synthetic, environment_tag
) values (
  '10000000-0000-4000-8000-000000000001',
  'SMKH-DEMO-SYNTHETIC-001',
  '10000000-0000-4000-8000-000000000002',
  'demo_seed', 'staging.sellmykernhome.invalid', 'seller',
  'Casey', 'Example', '(661) 555-0100', 'casey@example.test', 'email',
  'seller-property', 'Synthetic Adam partnership demonstration record.',
  '1000 Example Avenue', 'Bakersfield', '93301', 'Single-family home',
  'Significant repairs needed', 'Vacant', 'Exploring options',
  '{"utm_source":"private-demo","utm_medium":"synthetic-seed","utm_campaign":"adam-stage1"}'::pg_catalog.jsonb,
  '{"privacy_acknowledged":true,"privacy_version":"synthetic-demo-v1","marketing_consent":false}'::pg_catalog.jsonb,
  'new', true, 'staging'
)
on conflict (id) do nothing;

commit;
