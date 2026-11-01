# Sell My Kern Home — PropertyIntelligence migration assessment

Date: 2026-11-01
Status: **PI migration applied and verified; application deployment pending**

## Decision baseline

PropertyIntelligence project `jsrvdryddojhkmjzotef` is the permanent SMKH database target. The release starts with an empty SMKH lead store. No historical record, audit event, notification record, membership, or rate-limit row is copied from another project. No source-project database connection is part of the PI preflight, migration, postflight, application cutover, or recovery procedure.

The live inspection used the owner-supplied PI Session Pooler endpoint, project-qualified username, and downloaded Server root certificate with `sslmode=verify-full`. It authenticated successfully to PI PostgreSQL 17.6, verified the Supabase Auth dependencies in an explicit read-only transaction, and found zero existing `smkh_*` relations or functions. The owner account was resolved programmatically as UUID `6931a31e-9d5e-47e1-8878-139b5f9cd5c6` for `sroy@worksidesoftware.com`.

The controlled migration started at `2026-11-01T11:34:48.7109593-08:00` and passed postflight. The existing non-SMKH PI catalog/permission fingerprint was `5daf2e7bd81e3b2586768646ac1e6ef5` both before and after migration. The pre-migration schema snapshot SHA-256 is `1486FEE99322E0FCC291601F3DE0265861307D1B256A7F26374EA06405A9FC8E`.

## Applied database change

`supabase/migrations/20261101_smkh_property_intelligence.sql` is additive and fails closed if an intended SMKH table, index, or function already exists. It creates:

Prepared SHA-256: `C290C893CD70207CE2CB157C677AA10DE4E06A45B0F7F067E39E3303EA30917C`.

- `smkh_admin_memberships`
- `smkh_leads` — empty after migration
- `smkh_lead_events` — empty after migration
- `smkh_notifications` — empty after migration
- `smkh_rate_limits` — empty after migration
- `smkh_audit_independent_lead()`
- `smkh_update_lead(uuid,text,text,timestamptz,timestamptz)`
- `smkh_check_rate_limit(text,integer,integer)`

Exactly one active, confirmed, non-deleted, non-banned PI Auth user must match the explicitly supplied UUID/email pair. The migration creates that membership with role `owner`; it does not create or modify the Auth user.

The migration contains no cross-project reads, data-copy statements, legacy source columns, or references to unrelated PI tables. All intended tables and functions are schema-qualified. Every `SECURITY DEFINER` function uses `search_path = pg_catalog`; trigger execution is not granted to application roles.

## Access model

- `anon` receives no table access and no RPC execution.
- `authenticated` receives SELECT on membership, lead, audit, and notification tables. RLS limits membership reads to self and operational records to active SMKH members.
- Human lead mutation is available only through `smkh_update_lead`, which derives the actor from `auth.uid()`, verifies an active operator membership, and sets transaction-local audit context.
- `service_role` receives SELECT/INSERT only where the current server implementation requires lead creation and notification logging. Direct lead UPDATE/DELETE, membership mutation, audit mutation, notification UPDATE/DELETE, and direct rate-limit table access are revoked. Rate limiting is available only through its restricted RPC.

The PI secret key remains a project-wide `service_role` credential and bypasses RLS across the project. SMKH grants minimize access to newly created objects, but they cannot confine a compromised PI secret key from unrelated PI objects that already grant `service_role` access. The key must remain server-only. Stronger isolation would require a dedicated database role/connection or an equivalent trusted broker and is a separate architecture decision.

## Verification artifacts

- Read-only preflight: `supabase/verification/20261101_smkh_pi_preflight.psql`
- Postflight: `supabase/verification/20261101_smkh_pi_postflight.sql`
- Controlled apply wrapper: `supabase/verification/20261101_smkh_pi_apply_and_postflight.psql`
- Non-destructive emergency access disablement: `supabase/rollback/20261101_smkh_pi_disable_access.sql`
- Production procedure: `docs/SMKH_DIRECT_PRODUCTION_RUNBOOK.md`

The preflight verifies PI Auth dependencies, owner identity, and zero naming collisions without writing. Postflight requires one owner and zero operational rows, verifies RLS and effective grants, and checks restricted RPC execution. Existing PI catalog/count baselines must be captured before execution and compared after migration because the migration must not alter unrelated objects.

## Application and Netlify impact

Before application deployment, Netlify must switch the public Supabase URL, publishable key, and server-only secret key together to PI. Public values are embedded at build time, so a new build is required. Existing Admin cookies must be replaced by a fresh PI Auth sign-in.

Turnstile keys and behavior are independent of the Supabase project. Resend settings are also independent, but notifications remain disabled through cutover. Preserve the rate-limit HMAC secret, keep indexing disabled, remove any obsolete GNZ Admin URL, and do not put a database password in Netlify.

## Recovery

Preferred rollback is application-only: restore the prior application deployment and disable intake/notifications while retaining all SMKH records. The prepared emergency SQL only revokes access after an explicit transaction-local safety latch; it drops no object and deletes no row. Destructive rollback is not prepared or authorized.

## Verification results

- Targeted PGlite migration regression: pass.
- Full automated test suite: pass.
- ESLint: pass.
- Next.js production build: pass.
- Live PI TLS certificate validation and project-qualified authentication: pass.
- Live PI identity: pass — PostgreSQL 17.6 with required Supabase Auth objects.
- Live PI SMKH collision check: pass — zero existing matching relations/functions.
- Live PI owner UUID/email verification: pass.
- Live PI read-only preflight: pass.
- PI migration and postflight: pass.
- Owner membership: pass — exactly one active `Workside Software` owner.
- Operational rows after migration: zero leads, audit events, notifications, and rate-limit rows.
- Existing PI catalog/permission fingerprint preservation: pass.

## Remaining deployment requirements

1. Configure the PI URL, publishable key, and server-only secret key in Netlify together.
2. Keep notifications and indexing disabled through application verification.
3. Deploy only the reviewed application commit and confirm PI owner sign-in and the empty Admin lead list.
