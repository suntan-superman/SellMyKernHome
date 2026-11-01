# Sell My Kern Home — PI production database execution

Execution date: 2026-11-01
Target: PropertyIntelligence (`jsrvdryddojhkmjzotef`)
Migration SHA-256: `C290C893CD70207CE2CB157C677AA10DE4E06A45B0F7F067E39E3303EA30917C`

## Result

The PI-only additive migration started at `2026-11-01T11:34:48.7109593-08:00` and passed its immediate postflight. It created the independent empty SMKH schema and exactly one owner membership:

- Auth UUID: `6931a31e-9d5e-47e1-8878-139b5f9cd5c6`
- Auth email: `sroy@worksidesoftware.com`
- Display name: `Workside Software`
- Role: `owner`
- Active: `true`

Postflight counts were zero for leads, audit events, notification records, and rate-limit rows.

## Safety gates

- Client TLS `verify-full`: pass.
- PI identity: pass — PostgreSQL 17.6 and required Supabase Auth objects.
- Pre-existing `smkh_*` collisions: zero.
- Owner UUID/email active-account verification: pass.
- Read-only preflight: pass.
- Pre-migration schema snapshot SHA-256: `1486FEE99322E0FCC291601F3DE0265861307D1B256A7F26374EA06405A9FC8E`.
- Existing non-SMKH PI catalog/permission fingerprint before: `5daf2e7bd81e3b2586768646ac1e6ef5`.
- Existing non-SMKH PI catalog/permission fingerprint after: `5daf2e7bd81e3b2586768646ac1e6ef5`.
- RLS enabled on all five SMKH tables.
- Every SMKH `SECURITY DEFINER` function uses `search_path=pg_catalog`.
- Service-role UPDATE/DELETE and membership/audit mutation restrictions: postflight pass.

No CutPro connection was made. No historical record was copied. No existing PI object, grant, RLS policy, function, or trigger was changed by the reviewed fingerprint. No application deployment, Netlify environment change, DNS change, email send, synthetic lead, or indexing change occurred.

## Remaining work

Update the GitHub-connected Netlify application to the PI public URL, PI publishable key, and PI server-only secret key as one controlled cutover. Keep `SMKH_NOTIFICATIONS_ENABLED=false` and `NEXT_PUBLIC_ROBOTS_INDEX=false`, deploy the reviewed commit, then verify owner sign-in and the empty Admin lead list before enabling any intake.
