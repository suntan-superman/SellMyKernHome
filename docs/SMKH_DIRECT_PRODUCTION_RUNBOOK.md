# Sell My Kern Home — PropertyIntelligence production runbook

Status: PI database migration applied and postflight verified on 2026-11-01. Application deployment remains pending and is not authorized by this document.

Applied migration SHA-256: `C290C893CD70207CE2CB157C677AA10DE4E06A45B0F7F067E39E3303EA30917C`. Do not rerun the migration.

## Fixed scope

- Permanent database project: PropertyIntelligence (`jsrvdryddojhkmjzotef`).
- Session Pooler: `aws-0-us-west-2.pooler.supabase.com:5432`, database `postgres`, username `postgres.jsrvdryddojhkmjzotef`.
- Migration: `supabase/migrations/20261101_smkh_property_intelligence.sql`.
- The migration is additive and creates an empty SMKH workflow. It does not connect to another project, import historical records, create Auth users, or alter existing PI objects or permissions.
- Exactly one existing, active, confirmed PI Auth user is bootstrapped as owner after its UUID/email pair is verified read-only.
- No staging infrastructure is used.

## Objects introduced

Tables: `smkh_admin_memberships`, `smkh_leads`, `smkh_lead_events`, `smkh_notifications`, and `smkh_rate_limits`.

Functions: `smkh_audit_independent_lead()`, `smkh_update_lead(uuid,text,text,timestamptz,timestamptz)`, and `smkh_check_rate_limit(text,integer,integer)`.

The migration also adds four lead indexes, one audit index, one notification index, four read policies, and one audit trigger. It fails closed if any intended table, index, or function already exists.

## Mandatory backup and identity gate

1. Download the PI Server root certificate from Supabase Database Settings.
2. Connect through the verified Session Pooler with `sslmode=verify-full`; never downgrade to `require` for release operations.
3. Enter the database password through `Read-Host -AsSecureString` or the local masked operator prompt. Never put it in a URI, command history, repository file, or log.
4. Verify the connection uses TLS, database `postgres`, the project-qualified pooler username, and the expected PI schema fingerprint.
5. Create checksummed custom-format and schema-only backups of PI, restore-test the custom backup into an empty local PostgreSQL database, and reconcile all PI table counts. Stop on any restore error or drift.
6. Record a fresh schema-only dump and catalog snapshot of every existing PI table, grant, RLS policy, function, and trigger. Postflight must show that only the reviewed `smkh_*` objects were added.

## Owner verification and read-only preflight

Locate the intended owner by email in PI `auth.users`; copy the returned UUID rather than generating or reusing a UUID from another project. Confirm that the record is active, confirmed, not deleted, and not banned.

In one protected PowerShell session, set temporary process values without echoing them:

```powershell
$env:SMKH_RELEASE_OWNER_USER_ID = Read-Host 'Verified PI Auth UUID'
$env:SMKH_RELEASE_OWNER_EMAIL = Read-Host 'Matching PI Auth email'
$env:SMKH_RELEASE_OWNER_DISPLAY_NAME = Read-Host 'Approved owner display name'
```

Run the PI-only read-only wrapper with the verified TLS connection:

```powershell
psql "$env:SMKH_PI_DB_CONNECTION" `
  --set=owner_user_id="$env:SMKH_RELEASE_OWNER_USER_ID" `
  --set=owner_email="$env:SMKH_RELEASE_OWNER_EMAIL" `
  --set=owner_display_name="$env:SMKH_RELEASE_OWNER_DISPLAY_NAME" `
  --file=supabase/verification/20261101_smkh_pi_preflight.psql
```

Preflight must show a verified Auth match and zero SMKH collisions. Review and authorize the exact migration SHA-256 after the live preflight; any file change invalidates that approval.

## Executed database sequence

The following sequence was completed once on 2026-11-01 and must not be repeated:

```powershell
psql "$env:SMKH_PI_DB_CONNECTION" `
  --set=owner_user_id="$env:SMKH_RELEASE_OWNER_USER_ID" `
  --set=owner_email="$env:SMKH_RELEASE_OWNER_EMAIL" `
  --set=owner_display_name="$env:SMKH_RELEASE_OWNER_DISPLAY_NAME" `
  --file=supabase/verification/20261101_smkh_pi_apply_and_postflight.psql
```

The postflight must report one owner membership and zero leads, events, notifications, and rate-limit rows. It must also verify RLS, grants, restricted RPC execution, function search paths, and service-role limitations. Compare the PI catalog snapshot and counts against the backup baseline before changing Netlify.

## Netlify environment cutover

Change these values together only after database postflight passes:

- `NEXT_PUBLIC_SUPABASE_URL` → `https://jsrvdryddojhkmjzotef.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → PI publishable key
- `SUPABASE_SECRET_KEY` → PI server-only secret key

Review or remove obsolete values:

- Remove any database password from Netlify; the application does not use it.
- Remove `GNZ_ADMIN_BASE_URL` if present.
- Set `SMKH_ADMIN_BASE_URL` to the approved SellMyKernHome production origin.

Keep these controls unchanged unless separately approved:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`: site integration remains tied to the public domain, not Supabase.
- `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, and `LEAD_NOTIFICATION_EMAIL`: review recipients/sender separately; keep `SMKH_NOTIFICATIONS_ENABLED=false` during cutover.
- `RATE_LIMIT_HMAC_SECRET`: retain the current strong value; PI starts with an empty database rate-limit table.
- `NEXT_PUBLIC_ROBOTS_INDEX=false`: remain disabled through release verification.

The public Supabase URL and publishable key are build-time Next.js values, so the Netlify environment update requires a new build. The secret key is server-only and must never use a `NEXT_PUBLIC_` name. Existing browser Admin cookies belong to the previous Auth project and must be replaced by a fresh PI sign-in.

## Verification before enabling intake

1. Sign in as the verified PI owner and confirm the Admin lead list is empty.
2. Confirm an authenticated PI non-member sees no SMKH rows and cannot call `smkh_update_lead`.
3. Confirm anonymous users cannot read any SMKH table or execute either RPC.
4. Confirm the secret-key server client can insert/select leads and insert notifications, but cannot directly update/delete leads or mutate memberships/audit records.
5. Keep notifications, indexing, and public intake disabled until a separately authorized synthetic end-to-end test.

## Non-destructive recovery

Preferred recovery is application-only: restore the prior Netlify deployment and disable intake and notifications. Retain all SMKH database objects and records for diagnosis.

If database access must be disabled, an authorized database owner may revoke application grants on the new SMKH tables and functions after recording post-incident counts. Do not drop tables, functions, policies, memberships, leads, audit history, notifications, or rate-limit records automatically. Destructive removal requires a separately reviewed script, a verified backup, impact analysis, and explicit authorization.

Finally clear all temporary connection and owner variables from the operator process.
