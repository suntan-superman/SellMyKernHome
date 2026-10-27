# SellMyKernHome.com — Codex Implementation Specification
## Phase 2: Technical SEO, Local Seller Acquisition, Content and Conversion Tracking
**Prepared for:** Workside Software LLC / GNZ Marketing Group, LLC  
**Production canonical domain:** https://sellmykernhome.com  
**Date:** October 14, 2026  
**Implementation language:** JavaScript (not TypeScript)  
**Status:** Development authorized; public indexing and unapproved claims NOT authorized

## 1. Objective and non-negotiable constraints
Build a strong technical and content SEO foundation for the **existing, live** SellMyKernHome website, focused on qualified homeowner inquiries in Bakersfield and Kern County. The website already accepts seller submissions that reach the GNZ Admin panel. Preserve this working flow, its security controls, and the existing visual design.

**Current verified infrastructure (do not redo):**
- Netlify is connected to the SellMyKernHome GitHub repository and publishes the Next.js application.
- `https://sellmykernhome.com` loads over HTTPS and is the primary production domain.
- `https://www.sellmykernhome.com` works and redirects to the primary domain.
- Cloudflare DNS is configured for external Netlify hosting; Let's Encrypt SSL is active.
- GNZ Supabase production migration is complete and the GNZ Admin seller lead workflow is functioning.
- Turnstile and rate limiting passed isolated tests; real-domain behavior must still be confirmed as part of this phase.
- Seller inquiry submissions have previously been confirmed to reach GNZ Admin.

**Do not:** change Cloudflare DNS, re-add domains, reissue certificates, modify Supabase schemas, replace the working forms, create a second CRM, publish investment opportunities, expose secrets, or turn on public indexing without explicit authorization.

**Business/legal gate:** Gabriel has not yet definitively confirmed the exact real estate transaction structure. Do not claim GNZ is a licensed brokerage, direct cash buyer, guarantees offers, can close in a specific time, or is entitled to market others' properties. Do not misrepresent contract assignment. Draft pages must use truthful, appropriately conditional language pending client/legal review.

## 2. Phase 0 — read-only baseline and regression snapshot
Inspect the actual repository before editing. Identify:
- Next.js version, App Router structure, deployment settings, and routes.
- Existing homepage, seller content, inquiry form, Turnstile integration, server submission endpoint, Supabase writes, Resend notifications, and GNZ Admin link.
- Existing metadata, canonical tags, Open Graph, sitemap, robots, structured data, redirects, and indexing flag.
- Existing GA4 / Search Console integration, UTM persistence, event tracking, and consent handling.
- Existing images, fonts, Core Web Vitals opportunities, internal links, accessibility, and responsive breakpoints.

Record a baseline including route inventory, screenshots at 390px and 1280px, test results, and any actual observed defects. Create `docs/seo-baseline-audit.md` with issue, evidence/file, impact, fix, and priority. Do not assume a missing feature until verified.

## 3. Production domain, canonical and indexing policy
- Treat **`https://sellmykernhome.com`** as the only production canonical origin.
- Verify Netlify `www` → apex redirect. Do not create redirect loops.
- Audit Netlify subdomain `https://sellmykernhome.netlify.app` and ensure it does not create a duplicate indexable property. Prefer appropriate host redirect or `noindex` treatment consistent with Netlify and the existing app. Avoid changes that break previews.
- Audit all absolute internal links, sitemap URLs, JSON-LD URLs, Open Graph URLs, form return URLs, and environment-configured site origins. Replace any obsolete canonical host with the permanent domain.
- Keep `NEXT_PUBLIC_ROBOTS_INDEX=false` for now. Confirm **server-rendered** `noindex` on public pages while disabled; do not rely on `robots.txt` alone. Do not block crawling of a page in a way that prevents discovery of its `noindex` directive.
- Ensure private/admin/API/preview/draft pages are never indexable.
- Implement a safe documented launch switch that, **only after explicit approval**, enables indexing, canonical sitemap publication, and Search Console submission. Changing the environment variable may require a fresh Netlify build.
- No DNS, registrar, or SSL changes are in scope.

## 4. Keyword research and search-intent architecture
Research target queries for homeowners in Bakersfield/Kern County. Start with these **hypotheses**, not asserted high-volume keywords:
- sell my house Bakersfield
- sell house as-is Bakersfield
- sell inherited house Bakersfield
- sell house that needs repairs Bakersfield
- sell rental property Bakersfield
- sell home without listing Bakersfield
- off-market home sale Kern County

Use available first-party data, Google autocomplete/search results, and reputable keyword sources where available. Distinguish observed evidence from estimates. Never fabricate search volumes, keyword difficulty, ranking positions, or competitors' lead counts.

Create `docs/seo-keyword-map.md` listing intent, target audience, primary/secondary phrases, proposed URL, unique title/H1, differentiation, related pages, and CTA. Prevent cannibalization: one primary intent per page. Prioritize relevance and useful content over keyword repetition.

## 5. Page architecture and content implementation
Reuse existing equivalent pages where present; do not create duplicate URLs or competing pages. Maintain the existing design system, polished hero, CTAs, and responsive experience.

Proposed page targets (adjust after route audit):
1. **Homepage `/`** — broad Bakersfield/Kern seller intent; clearly explain what visitors can do, how inquiry works, and why the site is useful.
2. **`/sell-your-house-bakersfield`** — local homeowner sale options, process, common questions.
3. **`/sell-house-as-is-bakersfield`** — considerations for selling without completing repairs.
4. **`/sell-inherited-house-bakersfield`** — inherited-property questions; avoid individualized probate/tax/legal advice.
5. **`/sell-house-needs-repairs-bakersfield`** — condition, disclosure, evaluation, potential pathways.
6. **`/sell-rental-property-bakersfield`** — rental/tenant-occupied sale considerations; respect California tenant rights.

For each page:
- Unique, accurate H1, metadata title/description, canonical, accessible headings.
- Helpful, locally relevant original content addressing the searcher's question.
- Clear explanation of GNZ's role without unsupported direct-buyer or brokerage claims.
- One clear primary CTA to the **existing secure seller form**; optional secondary CTA.
- Appropriate internal links, breadcrumb UI where useful, accessible imagery with descriptive alt text.
- No invented testimonials, review stars, transactions, licensing, office address, cash offers, closing speed, or case studies.
- No copied competitor text or branding.
- Mark any content requiring Gabe's approval in `docs/seo-content-approval.md`, not as conspicuous TODO text on the public site.

## 6. Educational content (drafts pending approval)
Prepare three substantive, useful pieces:
- What to Know Before Selling a House As-Is in Bakersfield
- Selling an Inherited Property in Kern County: Questions to Consider
- Understanding Your Options When a House Needs Major Repairs

Content must be original, factual, non-repetitive, and practically useful. Cite or link to authoritative public sources for consequential legal/financial claims. Provide relevant internal links to service pages. Do not publish unreviewed legal or transaction-specific statements. If the current site has an editorial system, integrate drafts with it; otherwise use the project's existing content conventions without adding a CMS unnecessarily.

## 7. Technical SEO
Audit and implement only missing or defective elements:
- Next.js Metadata API (version-appropriate), unique page titles and descriptions.
- Canonical links to `https://sellmykernhome.com`.
- Open Graph and social sharing metadata/images with accurate production URLs.
- Dynamic or static sitemap containing **only** approved, published, canonical, indexable pages; respect indexing gate.
- Correct robots directives and private-route exclusion.
- Appropriate JSON-LD (`Organization`, `WebSite`, `BreadcrumbList` when applicable). Use `LocalBusiness` only if actual business eligibility, name, contact details, and location/service-area information are verified. Do not invent FAQ rich-result eligibility or reviews.
- Internal linking, no broken links, useful 404 behavior, permanent redirects for legitimately replaced routes.
- No duplicate metadata, duplicate indexable hostname, soft-404 placeholder pages, or accidentally indexed drafts.
- Ensure important content is present in rendered HTML and accessible without client-side interactions.

## 8. Local credibility and conversion
Keep the GNZ umbrella relationship transparent and the seller site consumer-focused. Use real Bakersfield/Kern references where useful; do not manufacture physical premises, years in business, client counts, or reviews. Do not create a Google Business Profile without independently confirming eligibility and genuine in-person customer contact; lead-generation-only businesses may not qualify.

Review CTA placement, above-the-fold clarity, form length, error/success messages, mobile keyboard usability, phone/email links, privacy notices, and trust signals. Preserve the existing server-side form validation, Turnstile Siteverify, token replay rejection, rate limiting, insertion-before-notification behavior, source (`seller_web`, `seller`, `sellmykernhome.com`) and UTM attribution.

## 9. Analytics and measurement
- Audit existing GA4 configuration; never invent a Measurement ID.
- Instrument, if missing: `seller_form_start`, `seller_form_submit_success`, `seller_form_validation_error`, `primary_cta_click`, `phone_click`, `email_click`.
- Only count confirmed successful server-side submissions as leads; prevent double counting.
- Do not send names, addresses, phone numbers, emails, or other PII in analytics parameters or page URLs.
- Preserve source/UTM data through the lead flow into GNZ Admin.
- Respect the site's privacy/consent design; don't silently add tracking that conflicts with applicable requirements.
- Prepare a GA4/Search Console configuration checklist for the **domain property** `sellmykernhome.com` and sitemap submission **after indexing approval**.
- Create `docs/seo-measurement-plan.md`: impressions, clicks, indexed pages, organic sessions, seller form conversions, qualified inquiries, and downstream GNZ lead statuses. Clearly distinguish rankings/traffic from qualified business outcomes.

## 10. Security and data protection
- Never commit `.env.local` or any secret; check client bundles for secret leakage.
- No new anonymous Supabase read access; keep RLS and trusted server routes intact.
- Never modify existing production GNZ schema or Admin permissions in this phase.
- Avoid real production submissions during automated tests. Use fixtures/mocks and official Turnstile test keys in isolated tests.
- Do not send real notification emails in automated tests.
- If testing the real domain, obtain authorization before creating any synthetic production lead or sending email, and clearly label and document test data.

## 11. Performance, accessibility and QA
Test 375px, 390px, 768px, 1280px, 1440px. Check mobile menus, no horizontal overflow, CTA reachability, form accessibility, labels/errors, contrast, keyboard operation, image layout shifts, loading performance, and Core Web Vitals. Improve image sizes, Next.js Image usage, font loading, and unnecessary JavaScript only where supported by measurements.

Required verification:
- All new/modified routes render and have unique metadata and correct canonical URL.
- `www` and Netlify-hostname behavior verified without breaking deployment previews.
- `NEXT_PUBLIC_ROBOTS_INDEX=false` actually yields `noindex` in deployed HTML.
- Sitemap does not list drafts or non-indexable routes.
- JSON-LD parses and matches actual claims.
- Internal links, redirects, Open Graph URLs, mobile layouts work.
- Existing seller form, Turnstile, rate limiting, GNZ Admin integration remain unchanged and functional.
- Failed Turnstile never creates a lead or sends notification.
- Lint, unit/integration tests, Playwright E2E where available, production build, dependency audit, and secret scan pass.

## 12. Deployment and release control
The permanent domain is already connected and live. **Do not reconnect it or change Cloudflare/Netlify DNS or SSL.**

Before coding, determine whether `main` auto-publishes. Prefer a feature branch and a review deployment; if Netlify auto-publishes from `main`, do not push unfinished or unapproved content to `main`. Do not claim the review deployment is private unless access protection is actually enabled. Do not deploy without approval. Maintain `NEXT_PUBLIC_ROBOTS_INDEX=false` until Gabe approves final business/legal wording and a separate launch authorization is given.

Prepare the code and a safe deployment plan, then stop for review.

## 13. Deliverables
1. `docs/seo-baseline-audit.md`
2. `docs/seo-keyword-map.md`
3. `docs/seo-content-approval.md`
4. `docs/seo-measurement-plan.md`
5. `docs/seo-implementation-report.md`
6. Optimized existing pages plus up to five differentiated seller landing pages, with no duplicates.
7. Three draft educational articles.
8. Verified canonical/metadata/sitemap/robots/structured-data configuration for permanent domain.
9. Analytics events and source attribution validation.
10. Test results, responsive screenshots, security and deployment-readiness report.

## 14. Acceptance criteria and final stop
- `https://sellmykernhome.com` is the sole canonical production origin.
- HTTPS and `www` redirect remain functional.
- The Netlify subdomain cannot create duplicate indexable content.
- Indexing remains disabled until explicit authorization.
- Pages are genuinely useful, locally relevant, and not keyword-stuffed.
- No unverified cash-buyer, brokerage, investment or closing promises are published.
- Existing seller lead submissions and GNZ Admin intake are preserved.
- All tests and build pass, no secrets leak, no unauthorized production data changes.
- Final report lists changed files, validated checks, content needing Gabe's approval, and launch steps.

**STOP after implementation and review report. Do not enable indexing, modify DNS, publish investment listings, change production database, or release unapproved claims.**
