# Sell My Kern Home direct-production release runbook

Status: implementation prepared; database migration and application deployment are **not authorized by this document**.

Reviewed migration SHA-256: `A4FAA6782406236B0F1DF30BF625A58B72F61A9C3F6422AC0464A80FCC35C828`. Any change to the migration invalidates this value and requires another review and authorization.

## Scope and verified baseline

The release creates an independent SMKH workflow inside the existing Supabase project. It does not update or delete `gnz_leads`, `admin_users`, legacy audit records, legacy notification records, or Supabase Auth users. The one-time copy selects only records whose `lead_type = 'seller'` or `source_site = 'sellmykernhome.com'`.

GNZ Admin memberships are not copied. The migration requires an explicitly supplied, independently verified Supabase Auth UUID and matching Auth email. It creates exactly one active SMKH membership with role `owner`. The UUID is never stored in source control or guessed from an email address. Historical seller assignment UUIDs and audit actors remain preserved as historical values without granting those users SMKH access.

The read-only inspection on 2026-11-01 found three `gnz_leads` records: two SMKH seller records and one unrelated investor record; two `admin_users` memberships; four legacy seller audit events; one legacy notification record; and one rate-limit bucket. These counts are observations, not assumptions. They must be rechecked immediately before execution.

## Required backup gate

Before migration, obtain a fresh direct PostgreSQL connection string from the verified Supabase project. Do not put it in shell history or the repository. Use a temporary environment variable and an encrypted, access-controlled backup directory outside the repository.

Create both a custom-format database backup and a schema-only backup. At minimum, the custom backup must include `auth.users`, `public.admin_users`, `public.gnz_leads`, `public.smkh_lead_audit`, `public.smkh_notification_logs`, and `public.smkh_rate_limits`; a complete project database backup is preferred.

```powershell
$secureDb = Read-Host 'Direct PostgreSQL connection' -AsSecureString
$env:SMKH_RELEASE_DB_URL = [System.Net.NetworkCredential]::new('', $secureDb).Password
pg_dump --format=custom --no-owner --no-acl --file <secure-path> "$env:SMKH_RELEASE_DB_URL"
pg_dump --schema-only --no-owner --no-acl --file <secure-schema-path> "$env:SMKH_RELEASE_DB_URL"
Get-FileHash -Algorithm SHA256 <secure-path>
Get-FileHash -Algorithm SHA256 <secure-schema-path>
```

Restore the custom backup into a disposable, isolated PostgreSQL database and run table counts plus representative schema/constraint checks. The restore test must succeed before production execution. Destroying that disposable restore requires separate confirmation and must never target production.

```powershell
$secureRestore = Read-Host 'Empty isolated restore database connection' -AsSecureString
$env:SMKH_RESTORE_DB_URL = [System.Net.NetworkCredential]::new('', $secureRestore).Password
pg_restore --exit-on-error --no-owner --no-acl --dbname "$env:SMKH_RESTORE_DB_URL" <secure-path>
psql "$env:SMKH_RESTORE_DB_URL" --command="select (select count(*) from public.gnz_leads) as gnz_leads, (select count(*) from public.admin_users) as admin_users, (select count(*) from public.smkh_lead_audit) as audit_events, (select count(*) from public.smkh_notification_logs) as notification_logs;"
Remove-Item Env:SMKH_RESTORE_DB_URL
Remove-Variable secureRestore -ErrorAction SilentlyContinue
```

## Execution gates

1. Verify the Supabase project reference and database host against the approved production record.
2. Record `Get-FileHash -Algorithm SHA256 supabase/migrations/20261101_smkh_independent_workflow.sql` and compare it with the release approval.
3. Record and verify both backup checksums and the isolated restore-test result.
4. In Supabase Auth, locate the owner's existing user by the independently verified owner email. Copy the UUID from the Auth record and verify the UUID/email pair a second time. Do not infer or generate a UUID, and do not modify the Auth user.
5. In the same protected PowerShell session, retain the direct connection variable used for backup and put the verified owner values into temporary process environment variables. If the backup was performed in another session, repeat the secure `Read-Host` connection steps above. Do not commit, echo, log, or place literal values in command history:

   ```powershell
   $env:SMKH_RELEASE_OWNER_USER_ID = Read-Host 'Verified existing Auth UUID'
   $env:SMKH_RELEASE_OWNER_EMAIL = Read-Host 'Matching verified Auth email'
   $env:SMKH_RELEASE_OWNER_DISPLAY_NAME = Read-Host 'Approved owner display name'
   ```

6. Run the read-only preflight in one direct `psql` session. The context script validates presence; the preflight validates that UUID and email match one existing Auth record. Stop on any exception, false owner match, count drift, schema drift, permission drift, missing required seller value, or pre-existing independent object:

   ```powershell
   psql "$env:SMKH_RELEASE_DB_URL" --set=owner_user_id="$env:SMKH_RELEASE_OWNER_USER_ID" --set=owner_email="$env:SMKH_RELEASE_OWNER_EMAIL" --set=owner_display_name="$env:SMKH_RELEASE_OWNER_DISPLAY_NAME" --file=supabase/verification/20261101_smkh_preflight.psql
   ```

7. Review and archive the preflight output. Reconfirm that it reports two source SMKH seller records and that all recorded GNZ counts match the backup/restore baseline. Obtain explicit authorization for the recorded migration checksum.
8. Apply the exact migration once and immediately run postflight in the same direct session:

   ```powershell
   psql "$env:SMKH_RELEASE_DB_URL" --set=owner_user_id="$env:SMKH_RELEASE_OWNER_USER_ID" --set=owner_email="$env:SMKH_RELEASE_OWNER_EMAIL" --set=owner_display_name="$env:SMKH_RELEASE_OWNER_DISPLAY_NAME" --file=supabase/verification/20261101_smkh_apply_and_postflight.psql
   ```

9. Postflight must report exactly one active owner membership matching the verified UUID; two independent seller records; zero missing source sellers; unchanged GNZ totals; RLS enabled; anonymous SELECT/RPC false; and service-role UPDATE, DELETE, and Admin RPC false. Stop without destructive rollback if any check fails.
10. Clear the temporary owner and connection environment variables from the session:

   ```powershell
   Remove-Item Env:SMKH_RELEASE_DB_URL,Env:SMKH_RELEASE_OWNER_USER_ID,Env:SMKH_RELEASE_OWNER_EMAIL,Env:SMKH_RELEASE_OWNER_DISPLAY_NAME
   Remove-Variable secureDb -ErrorAction SilentlyContinue
   ```
11. Sign in as the verified owner and confirm the two leads and historical audit events through RLS. Verify an authenticated non-member sees zero rows and cannot call the mutation RPC.
12. Only then deploy the reviewed application commit. Keep `NEXT_PUBLIC_ROBOTS_INDEX=false` and `SMKH_NOTIFICATIONS_ENABLED=false` until the separate content, sender-domain, recipient, and indexing gates pass.

## Non-destructive recovery

The preferred rollback is application-only: restore the previously deployed application commit and leave all new SMKH tables and copied history in place. Disable lead intake at the hosting layer if needed. Set `SMKH_NOTIFICATIONS_ENABLED=false`. Do not drop tables, columns, functions, policies, copied leads, audit events, or notification history automatically.

If database access must be disabled after a failed release, a database owner may revoke application grants on the new SMKH tables and `smkh_update_lead` after recording the incident and current counts. This retains all records for analysis and recovery. A destructive rollback would lose independent status changes, notes, follow-up dates, audit events, and notification logs created after cutover; it requires a separate reviewed script and explicit owner authorization.

## Synthetic post-deployment test

No production test record may be created without explicit authorization. When authorized, use conspicuously synthetic contact/property values, submit through the protected public endpoint with Turnstile, confirm one independent lead and one notification log, update it through `/admin`, and verify the audit event actor matches the authenticated administrator. Do not delete the record unless a specific safe cleanup procedure is separately approved.

## Indexing, analytics, and legal gates

The canonical origin is fixed to `https://sellmykernhome.com`. Sitemap entries are emitted only when `NEXT_PUBLIC_ROBOTS_INDEX=true`; draft seller pages and articles remain excluded through their approval flags. Before enabling indexing, review every emitted URL, public claim, privacy policy, terms, phone/email identity, and Google verification token. GA4 remains inert until a measurement ID is configured and a visitor grants consent. Tracking uses explicit path-only page views and allow-listed, PII-free events.
