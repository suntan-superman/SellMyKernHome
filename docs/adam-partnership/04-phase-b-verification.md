# Adam partnership demonstration — Phase B verification

> Historical verification only. The owner canceled this staging path on November 1, 2026.

**Verified:** November 1, 2026
**Implementation base:** local `main` at `c3ed843` plus the uncommitted Phase B worktree
**External actions:** none

## Delivered locally

- A fail-closed, whole-site staging access gate with a signed four-hour HttpOnly session, same-origin login/logout, login rate limiting, protected APIs, no-store headers, noindex headers/metadata, disallow-all robots output, and an empty staging sitemap.
- A private SMKH partnership shell that identifies Workside as technology owner/controller without changing the public brand or adding Adam to public branding.
- An independent, staging-only SMKH lead/membership/audit/notification/rate-limit schema and optional synthetic seed.
- A manual, property-only PI demonstration using an invented Kern County scenario and no seller PII.
- Explicit production/staging/local resource boundaries, GA4 consent/event planning, Search Console readiness planning, deployment gates, and recovery procedures.

No production database, GNZ Admin repository, Netlify site, Supabase project, Cloudflare setting, email service, analytics property, DNS record, or PI environment was accessed or changed.

## Verification evidence

| Check | Result |
|---|---|
| ESLint | Pass |
| Node/PGlite automated tests | 21/21 pass |
| Private-shell Playwright test | 1/1 pass |
| Existing Turnstile desktop/mobile and failure-mode harness | 10 applicable tests pass; 14 scenario-inapplicable tests intentionally skipped by the three targeted configurations |
| Default production-mode Next.js build | Pass, 32 static pages generated |
| Staging-mode Next.js build | Pass with production Supabase, Resend, Turnstile, analytics, and rate-limit variables explicitly blanked; isolated build-only placeholders used; no external connection made |
| Staging schema guard | Pass: refuses a database containing `public.gnz_leads` |
| Synthetic-data enforcement | Pass: ordinary email domains/non-demo records rejected |
| RLS/permissions | Pass: anon and non-member users cannot read; active viewer can read; service role cannot directly update; no application DELETE grant |
| Admin audit attribution | Pass: human actor comes from `auth.uid()`, viewer/outsider mutations fail, transaction-local context records the verified actor |
| Session security | Pass: signature, scope, expiry, secret binding, HttpOnly/SameSite cookie, and unauthorized API behavior tested |
| Secret-pattern scan of changed/untracked non-env files | Pass: zero matching credential patterns |
| `git diff --check` | Pass (line-ending conversion warnings only) |
| Production dependency audit | Pass: 0 vulnerabilities |
| Full dependency audit at high threshold | Pass: no high or critical findings |

The full audit reports five moderate development-only findings in `minimatch` through ESLint. npm offers only a forced breaking downgrade to ESLint 4, so no unsafe automatic fix was applied. Recheck when the ESLint dependency chain publishes a compatible resolution.

## SQL objects prepared, not applied

- `public.smkh_admin_memberships`
- `public.smkh_leads`
- `public.smkh_lead_audit`
- `public.smkh_notification_logs`
- `public.smkh_rate_limits`
- `public.smkh_audit_lead()` trigger function and trigger
- `public.smkh_check_rate_limit(text, int4, int4)`
- `public.smkh_admin_update_lead(uuid, text, text, uuid, timestamptz, timestamptz)`
- Member-read RLS policies on membership, lead, audit, and notification tables

The human update RPC accepts no actor ID. It derives the administrator from the isolated Supabase JWT, verifies active owner/admin/operator membership, verifies any assignee, and grants EXECUTE only to `authenticated`. Automated inserts remain separately attributed as `system`.

## Files changed for Phase B

Application and configuration:

- `.env.example`, `netlify.toml`, `package.json`, `package-lock.json`, `proxy.js`
- `app/api/demo-access/*`, `app/api/leads/route.js`, `app/demo-access/*`, `app/demo/*`
- `app/layout.js`, `app/robots.js`, `app/page.js`, `app/contact/page.js`, `app/globals.css`
- `components/PropertyForm.js`, `components/TurnstileWidget.js`
- `lib/demo-access.js`, `lib/demo-session-core.js`, `lib/form-config.js`, `lib/runtime.js`
- `lib/leads.js`, `lib/notifications.js`, `lib/rateLimit.js`, `lib/site.js`, `lib/supabase.js`
- `scripts/dev-safe.mjs`

Schema and test artifacts:

- `supabase/staging/20261101_adam_demo.sql`
- `supabase/staging/20261101_adam_demo_seed.sql`
- `playwright.demo.config.js`
- `tests/adam-demo-schema.test.js`, `tests/demo-session.test.js`, `tests/e2e/demo-access.spec.js`
- `tests/content.test.js`, `tests/fixtures/mock-supabase.mjs`

Documentation:

- `docs/adam-partnership/01-repository-audit.md`
- `docs/adam-partnership/02-architecture-and-cutover.md`
- `docs/adam-partnership/03-manual-pi-demonstration.md`
- `docs/adam-partnership/04-phase-b-verification.md`

The pre-existing Phase A source report under `docs/adam-demo/` and the user-provided Stage 1 specification were preserved.

## Remaining prerequisites and risks

1. Explicitly approve and provision a new isolated staging Supabase project; configure its persistent `smkh.environment=staging` guard before any SQL is considered.
2. Explicitly approve a separate private Netlify staging site or deploy-preview policy and platform-level access protection. The in-process login limiter is per serverless instance and should not be the only perimeter control.
3. Supply new staging-only Supabase, access-gate, Turnstile, and rate-limit secrets through the staging environment. Do not inherit or copy production values.
4. Approve a synthetic Supabase Auth user and membership. The shared preview gate is not an Admin identity.
5. Supply the exact PI environment and documented capabilities before presenting a live PI workflow.
6. Authorize the exact GNZ Admin path/commit if a later read-only component reuse inspection is desired; none was inspected here.
7. Complete legal/content review before any public claims or transaction-specific economics.
8. GA4 consent mode, explicit `page_view`, and `generate_lead` are plans only; no analytics behavior was enabled in staging.
9. No real hosted PostgreSQL migration/restore test was possible without external provisioning. Local PGlite regression coverage passed; the guarded SQL still requires a fresh isolated-project preflight and backup/recovery decision before application.

## Recovery boundary

For code, disable `SMKH_DEMO_MODE` or revert the Phase B commit. For a future staging deployment, lock the preview first and retain the isolated synthetic records unless deletion receives separate authorization. Never run a GNZ production rollback for a staging issue, and never automatically drop the staging tables.

Phase B stops here pending approval for the external prerequisites. No deployment or database application is authorized by this report.
