# SellMyKernHome.com — Stage 1 Codex Implementation Plan
**Date:** November 1, 2026
**Status:** Proposed; audit-first, no production changes authorized

## Business objective
Create a private, working demonstration of the Workside-controlled SellMyKernHome.com seller acquisition platform for prospective operating partner Adam Teagarden. Preserve SellMyKernHome.com as the public consumer brand; do not rebrand the public site with Adam's name. Adam operates behind the scenes, subject to legally required brokerage and advertising disclosures.

GNZ has not paid for or used SellMyKernHome.com and has no stored seller leads there, per project owner. GNZ intends to focus on its own website and Property Intelligence. Nevertheless, verify existing infrastructure, access and records before changing anything.

## Non-negotiable guardrails
- Audit before editing. Do not assume paths, tables, environment variable names or features.
- Do not change production configuration, DNS, email routing, live databases or deployments without explicit authorization.
- No direct edits to production data; no destructive migrations.
- Do not copy production secrets into logs, reports, or the demo.
- Use a private staging deployment and synthetic lead/property data.
- Preserve existing Turnstile verification, rate limiting, RLS, consent controls and privacy protections.
- Do not claim that Adam is a cash buyer or licensed broker unless verified. Show required California DRE license and responsible brokerage disclosures where applicable after legal review.
- Do not implement transaction-based revenue payments until reviewed by California real estate counsel.
- Do not expose private seller details to analytics or PI demo exports.
- Prefer JavaScript, consistent with existing stack. Keep changes minimal and reversible.

## Phase A — Read-only repository audit
1. Inspect package.json, Next.js version, route structure, app/router layout, components, Supabase schema/migrations, middleware, deployment config and existing tests.
2. Inventory all GNZ references: visible copy, logos, footer, metadata, structured data, email recipients, API routes, auth roles, admin links, environment variables, hard-coded domain references and database records.
3. Trace the seller form end-to-end: validation, Turnstile, rate limit, insert, email, notifications, response handling, deduplication, audit logging.
4. Inspect existing SEO: sitemap, robots, canonical URLs, redirects, page titles/descriptions, local-business schema, Search Console verification and page indexing assumptions.
5. Inspect GA4 implementation: measurement ID, consent default/update sequence, page_view behavior, lead/CTA events, PII exclusion, browser requests and deployed behavior. A 204 network response alone does not prove reporting correctness.
6. Inspect GNZ admin code and determine what can be safely adapted into an independent SMKH admin without coupling access or data.
7. Inspect PI handoff options: existing link/deep link, exports, API availability and auth model. Do not assume a PI API exists.
8. Deliver `docs/adam-demo/01-repository-audit.md` with confirmed findings, evidence (file paths and line references), risks and recommendations. Stop and report any material ambiguity.

## Phase B — Demo architecture
Use existing SMKH Next.js application, Supabase, Cloudflare Turnstile, Resend and Netlify where verified. Avoid a full multi-tenant rewrite for Stage 1.

- Public identity: SellMyKernHome.com.
- Demo: private staging URL protected by authentication or access control; mark noindex, exclude from sitemap, block indexing.
- Config: isolate public brand, partner/operator details, lead recipients, admin access, and analytics IDs behind validated environment configuration.
- Data: separate staging Supabase project or equivalently isolated staging database with synthetic records; do not share production auth sessions or secrets.
- Production lead routing: untouched until separate cutover approval.
- Operator: Adam demo account with least-privilege permissions, provisioned only after approval.

Deliver `docs/adam-demo/02-architecture-and-cutover.md` including diagrams, environment matrix, rollback and deployment gates.

## Phase C — Seller acquisition dashboard
Implement or adapt authenticated routes, e.g. `/admin/login`, `/admin/leads`, `/admin/leads/[id]`, `/admin/settings` (final route choices depend on audit).

Minimum lead fields: ID, submission timestamp, seller name, contact information, property address, stated condition, seller timeline, preferred contact method, source/UTM (non-PII), status, assigned operator, notes and follow-up date. Only collect fields justified by the current form and business need.

Statuses: New, Contact Attempted, Qualified, Appointment, Offer Made, Under Contract, Closed, Lost. Allow authorized staff to update status, notes and follow-up. Maintain change audit trail. No automated SMS or outbound contact without consent and compliance review.

Security: server-side authorization on every read/write, RLS or equivalent database restrictions, session expiration, no public admin indexing, no anonymous reads, no leaked secrets. Verify actual SQL policies and tests.

Notifications: Resend to demo-only approved recipients; synthetic data only. Never send test leads to GNZ or Adam without authorization.

Deliver `docs/adam-demo/03-dashboard-qa.md` and screenshots/test evidence.

## Phase D — Property Intelligence demonstration
Choose one synthetic or authorized Kern County property scenario. Demonstrate intake -> qualification -> property evaluation -> investor package using currently supported PI features. Clearly label assumptions, example comparable sales, ARV, repair estimates, closing costs, margins and Monte Carlo output. Avoid invented live data.

Prefer a secure handoff to existing PI if no authenticated integration exists. Never embed credentials, share seller PII, or imply the website already automatically transfers records if it does not.

Deliver `docs/adam-demo/04-pi-demo-script.md` with exact click path and fallback if PI is unavailable.

## Phase E — SEO and GA4 certification
- Preserve existing public domain and canonical preference.
- Audit Google Search Console ownership, sitemap, indexing, schema and conversion landing pages.
- Configure staging so it is not indexed and does not pollute production analytics.
- Define events: `page_view`, `generate_lead`, form_start, CTA click, telephone click, email click; use supported naming conventions and avoid PII.
- Consent: verify denied defaults before analytics load and consent update after user acceptance; honor rejection and withdrawal.
- Test browser network, GA4 Realtime/DebugView where available, and backend event integrity; do not infer collection solely from 204 responses.
- Document what requires the owner's access to Google properties; do not fabricate successful verification.

Deliver `docs/adam-demo/05-seo-analytics-certification.md` with pass/fail evidence and unresolved issues.

## Phase F — Demo acceptance and release gates
1. Public branding is SMKH, not Adam or GNZ, except legally required operator/broker disclosures.
2. Staging access restricted and noindexed.
3. Form creates exactly one authorized synthetic lead; Turnstile and rate limiting work.
4. Lead appears in authorized dashboard; unauthorized user is denied.
5. Demo notifications route only to approved test recipients.
6. Lead statuses and notes persist with audit trail.
7. PI scenario can be demonstrated end-to-end without exposing confidential data.
8. Existing production deployment and lead routing unchanged.
9. SEO/GA4 tests have recorded evidence and accurately described limitations.
10. Build, lint, tests and security checks pass; rollback instructions documented.

Deliver `docs/adam-demo/06-final-acceptance.md` with PASS/FAIL for each gate, commit hash, deployment preview URL, known issues and required owner decisions.

## Explicitly out of scope for Stage 1
- Production cutover or public launch
- Automated deal revenue distribution or commission calculations
- Live ad spending or paid campaigns
- New scraping pipelines or data acquisition integrations
- Full multi-tenant SaaS conversion
- Automated contact with sellers
- Claims about Adam's license, brokerage or purchase capacity not verified

## Commercial and legal decisions before Stage 2
Document for counsel: proposed $199 monthly technology commitment, tentative 25% of narrowly defined net transaction proceeds, licensed-activity restrictions, whether a licensed entity or alternative fixed-fee structure is required, allowable deductions, attribution, dispute resolution, lead and customer data rights, termination, confidentiality and Workside IP ownership. Do not implement or promise revenue-sharing as legally approved.

## Initial Codex instruction
Start with Phase A only. Inspect the repository, create the audit report, and return a concise summary of existing architecture, GNZ dependencies, production risks, and a recommended Stage 1 implementation sequence. Do not modify application code, deploy, change secrets or touch production resources. Wait for approval before Phase B.
