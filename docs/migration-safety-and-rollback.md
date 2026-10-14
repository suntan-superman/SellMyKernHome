# Migration safety and recovery

Applies to supabase/migrations/20261014_sellmykernhome_leads.sql.

The forward migration is additive and transactional. Do not run it until the
database owner has approved the migration window and a verified restore point
exists. Prefer an application rollback that retains the new database objects
and records. The destructive SQL rollback is a last resort.

## Before the migration

1. Confirm the target project and record its project identifier without
   copying credentials into tickets, logs, or shell history.
2. Confirm the provider backup/PITR status and identify the exact restore point
   immediately before migration.
3. Create an encrypted logical backup using an approved database-owner
   workstation. At minimum, preserve:

   - the schema definition for public.gnz_leads and public.admin_users;
   - all rows from public.gnz_leads;
   - relevant Auth user identifiers needed by admin_users;
   - current grants, RLS state, policies, constraints, indexes, and triggers.

   A database owner may use pg_dump with credentials supplied through an
   approved secret mechanism, never inline in a committed script:

       pg_dump --format=custom --file=pre-smkh.dump <approved connection options>
       pg_dump --schema-only --file=pre-smkh-schema.sql <approved connection options>

4. Restore the backup into a disposable project or database and verify that
   the restored GNZ Admin can read and update a synthetic lead.
5. Record the row counts and status distribution using the queries below.

## Read-only preflight queries

These queries return counts and security metadata, not lead PII.

    select status, count(*) as lead_count
    from public.gnz_leads
    group by status
    order by status;

    select
      count(*) as all_leads,
      count(*) filter (where status not in ('new', 'contacted', 'qualified', 'closed'))
        as currently_incompatible_statuses
    from public.gnz_leads;

    select
      c.relrowsecurity as rls_enabled,
      c.relforcerowsecurity as rls_forced
    from pg_catalog.pg_class as c
    join pg_catalog.pg_namespace as n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'gnz_leads';

    select
      pg_catalog.has_table_privilege('anon', 'public.gnz_leads', 'select') as anon_select,
      pg_catalog.has_table_privilege('authenticated', 'public.gnz_leads', 'select') as authenticated_select,
      pg_catalog.has_table_privilege('service_role', 'public.gnz_leads', 'select,insert,update') as service_required_access,
      pg_catalog.has_table_privilege('service_role', 'public.gnz_leads', 'delete') as service_delete_to_remediate;

Run `supabase/verification/20261014_preflight.sql` for the complete gate. A
pre-existing service_role DELETE or other excess direct table privilege is an
expected remediation condition: the reviewed migration first revokes every
service_role table privilege, then grants only SELECT, INSERT, and UPDATE. It
is not a relaxed security expectation. The postflight must prove all excess
effective privileges are absent. Any browser access, missing required service
operation, table ownership by service_role, superuser capability, inherited
role membership, unexpected status, policy, constraint, trigger, or seller
object remains a stop condition.

## Post-migration evidence

After an authorized migration, capture these non-PII counts before enabling the
seller form:

    select lead_type, status, count(*) as lead_count
    from public.gnz_leads
    group by lead_type, status
    order by lead_type, status;

    select count(*) as seller_leads
    from public.gnz_leads
    where lead_type = 'seller';

    select actor_kind, count(*) as audit_events
    from public.smkh_lead_audit
    group by actor_kind
    order by actor_kind;

    select status, count(*) as notification_records
    from public.smkh_notification_logs
    group by status
    order by status;

Also verify:

- anonymous and ordinary authenticated clients cannot select, insert, update,
  or delete gnz_leads;
- the service role can select, insert, and update but cannot delete leads;
- only the service role can invoke smkh_check_rate_limit and
  smkh_admin_update_lead;
- an authorized GNZ Admin update creates an actor_kind = 'admin' audit event
  with that Admin's verified user ID;
- a seller API insert creates an actor_kind = 'system' audit event with no
  impersonated user ID.

## Preferred non-destructive application rollback

1. Disable new seller submissions at the hosting layer or return the seller
   form to maintenance mode.
2. Roll back the SellMyKernHome deployment to the last known-good application
   release.
3. Roll back the GNZ Admin application only if its new UI is malfunctioning.
   The legacy application safely ignores the additive columns and tables.
4. Leave the migration, seller leads, audit events, and notification records in
   place.
5. Revoke or rotate affected application credentials if the incident involves
   credential exposure.
6. Diagnose and deploy a forward fix. Re-enable submissions only after the
   security and synthetic-flow checks pass.

This procedure preserves all business and audit records and is the default
recovery choice.

## Destructive database rollback

The supplied rollback SQL is guarded by a transaction-local safety latch and
will abort unless an operator deliberately enables it. It also aborts if any
lead uses in_discussion or not_proceeding, because those values are invalid
under the legacy constraint.

Before considering it, run:

    select status, count(*)
    from public.gnz_leads
    where status in ('in_discussion', 'not_proceeding')
    group by status;

    select count(*) as seller_leads
    from public.gnz_leads
    where lead_type = 'seller';

    select count(*) as audit_events from public.smkh_lead_audit;
    select count(*) as notification_records from public.smkh_notification_logs;
    select count(*) as rate_limit_records from public.smkh_rate_limits;

The destructive rollback permanently removes:

- every seller-specific property, attribution, consent, assignment, source, and
  preferred-contact value;
- the lead_type classification for all GNZ leads;
- all seller audit history and administrator attribution;
- all notification delivery records;
- all rate-limit state;
- the expanded status constraint and supporting indexes/functions.

It must never normalize statuses or delete seller records automatically.
Export and obtain explicit disposition instructions for every affected record.
Only after backup verification, impact review, and explicit production
authorization may an operator manually enable the commented
SET LOCAL smkh.allow_destructive_rollback = 'yes' line and run the script as
one transaction.

