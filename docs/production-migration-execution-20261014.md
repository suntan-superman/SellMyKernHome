# Production migration execution report

Executed October 14, 2026 against the verified shared GNZ production Supabase
project.

## Authorized artifact

- Migration: `supabase/migrations/20261014_sellmykernhome_leads.sql`
- SHA-256: `0F2027D2883FBD0F29EC564CE062916C368FEE3F76E8BF43638AEE5C0F2FC175`
- Backup SHA-256: `7EFC6E879E195E478E54E943F591A514D5A468FAB996438C713345B53540AE6C`
- Migration start: 2026-10-14 14:50:27 PDT / 21:50:27 UTC
- Migration commit: 2026-10-14 14:50:29 PDT / 21:50:29 UTC

The migration was executed once as its single transaction. No destructive
rollback was attempted.

## Verification

- Immediate and final production postflight: pass.
- RLS enabled on `gnz_leads`, notification logs, audit events, and rate limits.
- Anonymous and authenticated roles have no effective lead access.
- `service_role` has effective SELECT, INSERT, and UPDATE on `gnz_leads`; it
  does not have DELETE, TRUNCATE, REFERENCES, TRIGGER, or MAINTAIN.
- Rate-limit and Admin-update RPC execution is restricted to `service_role`.
- The audit trigger function is not directly executable by API roles.
- Both existing GNZ Admin memberships were preserved.
- All pre-existing GNZ table counts matched the pre-migration backup baseline.
- A transaction-rolled-back production test verified seller insertion, rate
  limiting, verified Admin attribution, system attribution, and RPC behavior
  without leaving test records.

## GNZ Admin deployment

- Production commit: `c3bc05dd50504e7a9cb7582dc30c2fa6a8d11b7a`
- Commit time: 2026-10-14 14:56:45 PDT
- Scope: seller/investor lead views, seller details, assignee selection,
  expanded statuses, and the verified-actor Admin RPC path.
- The production release was built from `main` without the unrelated feature
  branch's public insights, selected-work, or investment-opportunity routes.
- Lint, 6 focused tests, production build, and dependency audit passed; the
  audit reported zero vulnerabilities.

## Production end-to-end record

The retained synthetic record is:

- Reference: `SMKH-PROD-E2E-20261014-145828`
- Lead ID: `e663f553-bee2-4e00-9ee1-d3577a867a70`
- Status: `in_discussion`
- Audit events: one system INSERT and one verified-Admin UPDATE

It was intentionally not deleted. Cleanup requires separate explicit
authorization and must target only this identifier.

## Launch state

SellMyKernHome was not deployed. Public seller intake remains disabled pending
Turnstile configuration, production environment completion, and final content
approval. No investment opportunities or unapproved transaction-specific
claims were published.

The authorized migration file remains byte-for-byte unchanged after execution
so its checksum continues to match the approved artifact. Its historical
pre-execution header is therefore intentionally not edited.
