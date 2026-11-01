# Adam partnership demonstration — Phase C certification checkpoint

**Date:** November 1, 2026
**Status:** Blocked safely before external provisioning
**Production impact:** None

## Source certification

| Item | Verified value |
|---|---|
| Feature branch | `codex/adam-phase-c-staging` |
| Phase B commit | `6d248235f24fc81e96bf2e7ece14d96544fd1831` |
| Git origin | `https://github.com/suntan-superman/SellMyKernHome.git` |
| Guarded schema SHA-256 | `CD92B256EDC2AD836C7BDAC9EFB419BB796CA4302F5A4A7A4BD25549C77B2B25` |
| Synthetic seed SHA-256 | `4214979FE215F01C4713FE734342CE3CC7D46B2AA1CB99CC9988BA542387812D` |
| Worktree after Phase B commit | Clean |
| Credential-pattern scan before commit | Zero matches |

The Phase B architecture, verification report, guarded schema, and optional synthetic seed were re-read before the commit. ESLint passed and all 21 Node/PGlite tests passed immediately before commit.

## External target certification

No external target can currently be certified.

| Resource | Identifier | Status |
|---|---|---|
| Supabase organization | Not available | No authenticated management session |
| Supabase staging project | Not created | No project reference or database target |
| Netlify team | Not available | No authenticated management session |
| Netlify staging site | Not created | No site ID |
| Deployment URL | Not available | No deployment performed |
| Staging Turnstile widget | Not created | No authorized Cloudflare staging credentials supplied |

Read-only discovery found:

- No `supabase` CLI command, `SUPABASE_ACCESS_TOKEN`, or `supabase/.temp/project-ref`.
- No `netlify` CLI command, `NETLIFY_AUTH_TOKEN`, or `.netlify/state.json`.
- The repository remains linked only to its existing GitHub origin; the feature branch has not been pushed or connected to hosting.

These conditions make the owning organizations, permissions, billing authority, region, and intended new target identities uncertain. In accordance with the Phase C safety gate, no CLI login was initiated and no resource was created.

## Tests not yet authorized by a certified target

The following live staging checks remain pending:

- Supabase project identity and absence of GNZ tables/resources.
- Persistent `smkh.environment=staging` target guard.
- Backup/recovery verification before schema application.
- Guarded schema and optional seed application.
- Synthetic Supabase Auth administrator and independent membership.
- Anonymous, non-member, viewer, operator, and service-role RLS/grant checks.
- Synthetic seller submission, rate limiting, status mutation, and audit attribution.
- Staging-specific Turnstile verification.
- Netlify private access, application session protection, noindex/robots behavior, and GitHub deployment control.
- Confirmation that staging analytics and outbound notifications remain disabled.

## Required authorization setup

The account owner should authenticate locally through the official browser-based login flows; access tokens, passwords, database passwords, and API keys must not be pasted into chat or committed.

Before resuming, identify:

1. The exact authorized Supabase organization, billing permission, desired staging region, and a new project name clearly marked non-production.
2. The exact authorized Netlify team and approval to create a separate private site linked to the feature branch/repository.
3. Whether Netlify team-level access protection is available; the application gate remains required regardless.
4. An approved method for a new staging-only Turnstile widget, or explicit approval to use Cloudflare's official test keys for the synthetic demonstration.
5. A private delivery method for the synthetic administrator credentials and staging access-gate credentials.

After authentication, account and project listings must be inspected read-only and the new IDs recorded here before setting environment variables or applying SQL.

## Rollback state

No external rollback is needed because no external state was created.

Local recovery options:

1. Keep the feature branch for review; it does not affect `main` or production.
2. Revert commit `6d24823` on the feature branch if the Phase B implementation is rejected.
3. Do not delete the branch or rewrite history without explicit authorization.

For a future provisioned staging environment, rollback remains: lock the staging site, disable `SMKH_DEMO_MODE`, revoke staging-only sessions/credentials, retain synthetic database records for review, and never run a destructive database teardown automatically.

## Safety attestation

- No production Supabase, GNZ Admin, DNS, Netlify production site, email route, analytics property, or live PI resource was accessed or changed.
- No schema or seed was applied anywhere outside local PGlite.
- No email was sent.
- No site or feature branch was deployed.
- Public indexing settings remain unchanged.

Phase C cannot be certified complete until authorized account access and exact target identities are available.
