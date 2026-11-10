do $postflight$
begin
  if pg_catalog.to_regclass('public.smkh_privacy_requests') is null
     or pg_catalog.to_regclass('public.smkh_sharing_suppressions') is null then
    raise exception 'Privacy-choice tables are missing.';
  end if;
  if not pg_catalog.has_function_privilege('service_role', 'public.smkh_create_privacy_request(uuid,text,text,text,text,text[],text,text)', 'execute')
     or not pg_catalog.has_function_privilege('service_role', 'public.smkh_is_sharing_suppressed(text[])', 'execute') then
    raise exception 'Trusted privacy RPC execution is missing.';
  end if;
  if pg_catalog.has_table_privilege('service_role', 'public.smkh_privacy_requests', 'select,insert,update,delete')
     or pg_catalog.has_table_privilege('service_role', 'public.smkh_sharing_suppressions', 'select,insert,update,delete')
     or pg_catalog.has_function_privilege('anon', 'public.smkh_create_privacy_request(uuid,text,text,text,text,text[],text,text)', 'execute')
     or pg_catalog.has_function_privilege('authenticated', 'public.smkh_create_privacy_request(uuid,text,text,text,text,text[],text,text)', 'execute') then
    raise exception 'Privacy least-privilege verification failed.';
  end if;
end;
$postflight$;

select
  (select count(*) from public.smkh_privacy_requests) as privacy_request_count,
  (select count(*) from public.smkh_sharing_suppressions) as suppression_count,
  (select count(*) from public.smkh_leads) as lead_count,
  pg_catalog.has_function_privilege('service_role', 'public.smkh_create_privacy_request(uuid,text,text,text,text,text[],text,text)', 'execute') as service_rpc,
  pg_catalog.has_function_privilege('anon', 'public.smkh_create_privacy_request(uuid,text,text,text,text,text[],text,text)', 'execute') as anon_rpc;
