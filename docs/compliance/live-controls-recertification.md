# SMKH Read-Only Live Control Recertification

**Owner:** Workside Software

**Status:** Internal runbook

**Recommended cadence:** Before a production release that changes intake, authorization, or notifications, and periodically under the owner's security review schedule

This check reports control state only. It must not select seller names, contact details, property data, notes, consent payloads, or other lead content.

## Required safeguards

1. Use the verified PropertyIntelligence Supabase project only.
2. Obtain database credentials through a secure local prompt; never place them in a command, log, report, or repository file.
3. Require TLS and verify project identity before querying controls.
4. Run the existing postflight SQL in a read-only transaction or against a read-only connection:
   `supabase/verification/20261101_smkh_pi_postflight.sql`.
5. Supply the verified owner context required by that script without printing the Auth UUID or email in shared output.
6. Run `npm run verify:production-config` in the same Netlify production-build context used for release certification. Report only pass/fail booleans; do not print environment-variable values.
7. Stop on any failed assertion. Do not change grants, RLS policies, memberships, notification settings, or records as part of recertification.

## Expected control results

- Exactly one explicitly approved active owner membership exists unless the owner has separately authorized a membership change.
- RLS remains enabled on every `smkh_*` table.
- `anon` has no seller-lead read access.
- `authenticated` access remains membership-gated by RLS and the trusted Admin RPC.
- `service_role` retains only the table and function permissions required by the server intake path; it has no lead update/delete permission and cannot execute the Admin mutation RPC.
- The Admin mutation RPC remains restricted to authenticated callers and derives the actor from the authenticated session.
- Production notifications remain disabled.
- Public and server Supabase configuration still targets the approved PropertyIntelligence project, while the server secret remains server-only.

## Evidence to retain

Record the date, repository commit, database project reference, script checksum, overall pass/fail state, non-sensitive object counts, and each privilege/RLS assertion. Do not retain credentials, access tokens, seller data, consent payloads, or complete environment dumps.

Any failure is configuration drift requiring a separate reviewed remediation plan. This runbook does not authorize a migration, destructive rollback, membership change, notification enablement, or production-data access.
