# Final migration hardening report

> Operational update: the authorized migration was applied successfully on
> October 14, 2026 at 14:50:29 PDT. See
> `docs/production-migration-execution-20261014.md` for execution evidence.

Completed October 14, 2026. The production migration remains unapplied.

## Files changed

SellMyKernHome:

- supabase/migrations/20261014_sellmykernhome_leads.sql
- supabase/rollback/20261014_sellmykernhome_leads.rollback.sql
- docs/migration-safety-and-rollback.md
- docs/deployment-runbook.md
- tests/content.test.js
- tests/migration.test.js
- package.json and package-lock.json

GNZ Marketing:

- app/api/admin/leads/[id]/route.js
- lib/supabase/server.js
- tests/validation.test.js
- eslint.config.mjs
- package.json and package-lock.json

Other GNZ compatibility files from the original implementation remain part of
the overall integration change.

## Security improvements

- The migration now re-enables RLS and reasserts deny-by-default grants on
  public.gnz_leads. Browser roles receive no lead privileges; service_role
  retains only select, insert, and update.
- Every SECURITY DEFINER function uses search_path = pg_catalog and
  schema-qualified application objects.
- Default function execution is revoked. The rate-limit and Admin-update RPCs
  are granted only to service_role. The trigger function is not callable by
  browser or service API roles.
- The Admin update RPC verifies both the acting Admin and assignee against
  public.admin_users.
- The GNZ route takes the actor identity only from the authenticated,
  membership-verified server session. It accepts no browser actor ID.
- Actor context is set transaction-locally, preventing pooled-connection
  leakage. Admin actions are recorded as admin; inserts and direct automated
  service actions are recorded as system.
- Server Supabase clients include an explicit Node 20 WebSocket transport.
- Credential assignments were removed from the GNZ README; scans found no
  matching secret values in either repository's committed history.

## SQL objects affected

- public.gnz_leads: additive seller/source/property/consent/assignment columns,
  expanded constraints, indexes, RLS/grants, and an audit trigger.
- public.smkh_notification_logs: new RLS-protected delivery log.
- public.smkh_lead_audit: new RLS-protected audit table with actor_kind and
  actor_id.
- public.smkh_rate_limits: new RLS-protected rate-limit state.
- public.smkh_audit_seller_lead(): hardened trigger function.
- public.smkh_check_rate_limit(...): hardened service-only RPC.
- public.smkh_admin_update_lead(...): new service-only, membership-verifying
  mutation RPC.
- public.smkh_seller_lead_audit: new trigger on public.gnz_leads.

## Compatibility and verification

An isolated in-memory PostgreSQL-compatible database was initialized with the
legacy GNZ schema and an existing synthetic lead. The complete forward
migration executed successfully and verified:

- the existing lead and its legacy status/note were preserved;
- legacy rows received the intended investor/source defaults;
- anon and authenticated roles could not read leads;
- service_role retained select, insert, and update but not delete;
- a seller insert created a system audit event;
- a verified Admin RPC update recorded the correct Admin user ID;
- a non-member actor was rejected;
- transaction-local actor context did not leak into the next automated update;
- old and new statuses remained valid;
- rate limiting allowed the first request and denied the over-limit request.

Results:

- SellMyKernHome lint: pass
- SellMyKernHome tests: 15/15 pass
- SellMyKernHome production build: pass
- SellMyKernHome browser/accessibility suite: 30/30 pass
- SellMyKernHome dependency audit: zero vulnerabilities
- GNZ lint: pass
- GNZ tests: 8/8 pass
- GNZ production build: pass
- GNZ dependency audit: zero vulnerabilities
- Read-only live verification: base table present, anonymous reads denied, both
  configured Admin memberships valid, seller migration still absent

## Remaining risks

- Live post-migration behavior cannot be proven until an explicitly authorized
  staging/production execution. Re-run all preflight queries immediately before
  migration because database state may change.
- Any holder of the service credential remains privileged. It must stay
  server-only and be rotated if exposure is suspected.
- Future human Admin mutations must use smkh_admin_update_lead; direct
  service-role updates are intentionally classified as system actions.
- Forward index creation and ALTER TABLE statements take locks. Current live
  lead count was zero during review, but the maintenance window must account for
  the current count.
- Turnstile and production URLs remain deployment prerequisites outside the
  migration itself.

## Migration execution plan

1. Obtain explicit production authorization and identify database/deployment
   owners and a rollback decision window.
2. Complete docs/migration-safety-and-rollback.md, verify PITR/provider backup,
   restore-test the logical backup, and rerun all read-only drift checks.
3. Keep the seller submission feature disabled.
4. Apply the reviewed migration as its single transaction.
5. Verify RLS, grants, function privileges, constraints, trigger installation,
   and unchanged pre-existing row counts.
6. Deploy the compatible GNZ Admin code. The migration must precede this deploy
   because the updated route calls the new RPC.
7. Use synthetic data to test seller creation, rate limiting, notification
   logging, authorized Admin updates, actor attribution, and unauthorized
   denial.
8. Deploy/enable SellMyKernHome only after all evidence passes.

## Recovery plan

Default recovery is non-destructive: disable seller submissions, roll back the
application deployments, retain all additive database objects and records, and
deploy a forward fix.

The SQL rollback is a last resort. It requires a verified backup, explicit
authorization, review of seller/audit/notification counts, resolution of new
status values, and manual activation of its transaction-local safety latch. It
never runs automatically.

## Production preflight remediation verification

Completed October 14, 2026. Production was inspected read-only and was not
modified. Neither application was deployed.

- The live `service_role` ACL on `public.gnz_leads` included DELETE, TRUNCATE,
  REFERENCES, TRIGGER, and MAINTAIN in addition to the required operations.
  `service_role` is not the table owner, is not superuser, and inherits no
  roles. It does have the expected Supabase `BYPASSRLS` attribute.
- The migration now executes `REVOKE ALL PRIVILEGES ON TABLE
  public.gnz_leads FROM service_role`, then grants only SELECT, INSERT, and
  UPDATE. The existing browser-role revocations remain unchanged.
- Source scans of SellMyKernHome and GNZ Marketing found no lead-delete route,
  client call, server operation, or RPC. The live database has no function
  that references `gnz_leads` and no foreign key referencing it; its only
  trigger is the GNZ updated-at trigger. The table owner and the drifted
  service role were the only explicit DELETE grantees.
- The revised preflight reports excess service privileges as an expected,
  visible remediation condition while continuing to fail for browser access,
  missing required operations, unexpected role ownership/membership, schema
  drift, or incompatible data. The postflight requires every excess effective
  privilege to be absent.
- SHA-256 of the isolated-tested migration:
  `0F2027D2883FBD0F29EC564CE062916C368FEE3F76E8BF43638AEE5C0F2FC175`.
- The verified production backup was restored again to a fresh PostgreSQL 18
  cluster. Provider-only Vault objects were omitted because that extension is
  unavailable in stock PostgreSQL; application schemas and data restored
  successfully. The restored counts were zero leads and two Admin memberships.
- The restored preflight passed and identified the recreated production ACL as
  expected remediation. The migration dry run committed once. Postflight
  passed with only SELECT/INSERT/UPDATE effective for `service_role`, browser
  access denied, all four tables protected by RLS, and RPC execution restricted
  as intended.
- Exact row counts for all pre-existing GNZ tables matched a second untouched
  restore. Restored-database tests passed for seller insertion, rate limiting,
  all legacy/new statuses, verified Admin attribution, system attribution,
  non-member rejection, browser denial, and service-role DELETE denial.
- SellMyKernHome: lint, 15 tests, production build, and dependency audit pass.
  GNZ Marketing: lint, 8 tests, production build, and dependency audit pass.

Renewed authorization is required before any production migration or
application deployment.

