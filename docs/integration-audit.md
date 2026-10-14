# GNZ integration audit

Audited October 14, 2026. Read-only review of the sibling `GNZMarketing` application; no production database changes were made.

## Confirmed reusable architecture

- Next.js App Router application with JavaScript, Netlify runtime, Supabase, Resend, and Cloudflare Turnstile.
- Public submissions are handled by a server route; the browser never receives the Supabase service credential.
- `public.gnz_leads` is the existing lead table. `submission_token` is unique and already supports idempotent form handling.
- `admin_users` plus Supabase Auth gates the GNZ Admin. Lead reads and updates use a server-only service client after the admin session is checked.
- RLS is enabled on `gnz_leads`; all access is revoked from `public`, `anon`, and `authenticated`, while `service_role` has the required grants.
- Resend is the notification provider. Turnstile and a request-IP rate limiter already exist in the GNZ contact flow.

## Safe reuse decision

Extend `gnz_leads` additively so seller and current GNZ inquiries stay in one protected queue. Seller-specific fields are nullable for existing records. Existing records default to `lead_type = investor` and `source_site = gnzmarketingllc.com`; the seller service writes `lead_type = seller` and `source_site = sellmykernhome.com`.

The proposed migration also adds delivery logs, an immutable seller-lead audit table, and an atomic database rate-limit function. It expands—rather than renames—the existing status constraint.

## Required changes before end-to-end activation

1. Review and apply `supabase/migrations/20261014_sellmykernhome_leads.sql` in a non-production Supabase branch/project first.
2. Configure the environment names listed in `.env.example`; do not copy literal values into source.
3. Deploy the GNZ Admin compatibility changes and regression-test existing contact, investor, login, content, and status-edit flows.
4. Configure a verified Resend sender and notification recipients; test success and failure logs.
5. Configure Turnstile for preview and production hostnames and provide a high-entropy rate-limit HMAC secret.
6. Approve retention, deletion, export, and incident-handling rules.

## Findings and risks

- **Critical:** a tracked GNZ README contains apparent administrator credentials. Rotate the affected credentials immediately, remove them from tracked content and Git history using an approved incident process, and review authentication logs. This build does not reuse, copy, or modify them.
- The current GNZ in-memory limiter is not reliable across serverless instances. This build uses an atomic Supabase-backed function with an in-memory development fallback.
- Current GNZ notification emails include submitted PII. Seller notifications in this build contain only a reference and a secure Admin link.
- Current GNZ statuses do not include `in_discussion` or `not_proceeding`; the migration expands the check constraint without invalidating current values.
- No current lead audit trail, assignment control, or notification-delivery table was found. The migration adds audit/delivery records, and the GNZ compatibility patch adds authorized-admin assignment plus notification-delivery visibility. Live staging verification remains required.
- Restricted CSV export does not exist and is intentionally not introduced without a retention/export policy and explicit authorization.

## Explicitly not reused or inferred

- No `.env.local` values, service-role keys, table guesses, public biography, telephone number, business address, offer language, transaction claims, or production URLs.
- No production migration, Netlify site creation, DNS change, custom-domain attachment, or analytics activation.

