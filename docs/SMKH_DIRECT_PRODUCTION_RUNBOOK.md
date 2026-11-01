# Sell My Kern Home direct-production release runbook

Status: implementation prepared; database migration and application deployment are **not authorized by this document**.

## Scope and verified baseline

The release creates an independent SMKH workflow inside the existing Supabase project. It does not update or delete `gnz_leads`, `admin_users`, legacy audit records, legacy notification records, or Supabase Auth users. The one-time copy selects only records whose `lead_type = 'seller'` or `source_site = 'sellmykernhome.com'`.

The read-only inspection on 2026-11-01 found three `gnz_leads` records: two SMKH seller records and one unrelated investor record; two `admin_users` memberships; four legacy seller audit events; one legacy notification record; and one rate-limit bucket. These counts are observations, not assumptions. They must be rechecked immediately before execution.

## Required backup gate

Before migration, obtain a fresh direct PostgreSQL connection string from the verified Supabase project. Do not put it in shell history or the repository. Use a temporary environment variable and an encrypted, access-controlled backup directory outside the repository.

Create both a custom-format database backup and a schema-only backup. At minimum, the custom backup must include `auth.users`, `public.admin_users`, `public.gnz_leads`, `public.smkh_lead_audit`, `public.smkh_notification_logs`, and `public.smkh_rate_limits`; a complete project database backup is preferred.

```powershell
pg_dump --format=custom --no-owner --no-acl --file <secure-path> <direct-postgres-connection>
pg_dump --schema-only --no-owner --no-acl --file <secure-schema-path> <direct-postgres-connection>
Get-FileHash -Algorithm SHA256 <secure-path>
Get-FileHash -Algorithm SHA256 <secure-schema-path>
```

Restore the custom backup into a disposable, isolated PostgreSQL database and run table counts plus representative schema/constraint checks. The restore test must succeed before production execution. Destroying that disposable restore requires separate confirmation and must never target production.

## Execution gates

1. Verify the Supabase project reference and database host against the approved production record.
2. Record `Get-FileHash -Algorithm SHA256 supabase/migrations/20261101_smkh_independent_workflow.sql` and compare it with the release approval.
3. Record and verify both backup checksums and the isolated restore-test result.
4. Run `supabase/verification/20261101_smkh_independent_preflight.sql` read-only. Stop on any exception, count drift, schema drift, privilege drift, or pre-existing independent object.
5. Apply `supabase/migrations/20261101_smkh_independent_workflow.sql` exactly once in a transaction.
6. Run `supabase/verification/20261101_smkh_independent_postflight.sql`. The GNZ totals and unrelated-record totals must equal preflight; source sellers missing must be zero; RLS must be enabled; anonymous SELECT and RPC must be false; service-role UPDATE, DELETE, and RPC must be false.
7. Sign in with each approved admin account and confirm its independent membership through RLS. Verify an authenticated non-member sees zero rows and cannot call the mutation RPC.
8. Only then deploy the reviewed application commit. Keep `NEXT_PUBLIC_ROBOTS_INDEX=false` and `SMKH_NOTIFICATIONS_ENABLED=false` until the separate content, sender-domain, recipient, and indexing gates pass.

## Non-destructive recovery

The preferred rollback is application-only: restore the previously deployed application commit and leave all new SMKH tables and copied history in place. Disable lead intake at the hosting layer if needed. Set `SMKH_NOTIFICATIONS_ENABLED=false`. Do not drop tables, columns, functions, policies, copied leads, audit events, or notification history automatically.

If database access must be disabled after a failed release, a database owner may revoke application grants on the new SMKH tables and `smkh_update_lead` after recording the incident and current counts. This retains all records for analysis and recovery. A destructive rollback would lose independent status changes, notes, follow-up dates, audit events, and notification logs created after cutover; it requires a separate reviewed script and explicit owner authorization.

## Synthetic post-deployment test

No production test record may be created without explicit authorization. When authorized, use conspicuously synthetic contact/property values, submit through the protected public endpoint with Turnstile, confirm one independent lead and one notification log, update it through `/admin`, and verify the audit event actor matches the authenticated administrator. Do not delete the record unless a specific safe cleanup procedure is separately approved.

## Indexing, analytics, and legal gates

The canonical origin is fixed to `https://sellmykernhome.com`. Sitemap entries are emitted only when `NEXT_PUBLIC_ROBOTS_INDEX=true`; draft seller pages and articles remain excluded through their approval flags. Before enabling indexing, review every emitted URL, public claim, privacy policy, terms, phone/email identity, and Google verification token. GA4 remains inert until a measurement ID is configured and a visitor grants consent. Tracking uses explicit path-only page views and allow-listed, PII-free events.
