-- Non-destructive application rollback. Existing requests and suppressions remain.
-- Do not drop privacy records or remove suppressions automatically.
begin;
revoke execute on function public.smkh_create_privacy_request(uuid,text,text,text,text,text[],text,text)
  from service_role;
revoke execute on function public.smkh_is_sharing_suppressed(text[])
  from service_role;
notify pgrst, 'reload schema';
commit;

-- Application rollback: deploy the prior website release while retaining the
-- privacy tables and suppression records. Re-enable RPC execution only after
-- the compatible application release is restored and verified.
