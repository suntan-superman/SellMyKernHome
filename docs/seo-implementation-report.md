# Sell My Kern Home Phase 2 SEO implementation report

Implementation date: October 14, 2026 (America/Los_Angeles)  
Local feature branch: `codex/phase2-seo-permanent-domain`  
Baseline commit: `0d2fb3d1c70a9ddba533b60a9b681f2b10be4cb9`  
Deployment status: **not deployed**  
Indexing status: **disabled** (`NEXT_PUBLIC_ROBOTS_INDEX=false`)

## Outcome

The Phase 2 technical SEO, local seller-page, educational-content, and conversion-measurement foundation is implemented locally. The permanent domain is the sole code-level canonical origin, the Netlify production hostname has an exact-host permanent redirect, public pages render `noindex, follow` while the gate is disabled, and drafts cannot enter the sitemap. Existing seller validation, Turnstile, rate limiting, server-side lead creation, notification ordering, and GNZ attribution remain covered by regression tests.

No code was pushed, no Netlify deployment was triggered, no indexing was enabled, no DNS/SSL setting was changed, no production lead was created, and no Supabase schema or production data was modified.

## Changed files by purpose

### Canonical, indexing, redirects, and structured data

- `lib/site.js`
- `app/layout.js`
- `app/robots.js`
- `app/sitemap.js`
- `next.config.js`
- `components/JsonLd.js`
- `components/Breadcrumbs.js`
- Metadata exports across About, Contact, FAQ, How It Works, Insights, Selling Situations, Privacy, Terms, article, and seller-page routes

### Seller acquisition pages and internal links

- `content/seller-pages.js`
- `components/SellerLandingPage.js`
- `app/sell-your-house-bakersfield/page.js`
- `app/sell-house-as-is-bakersfield/page.js`
- `app/sell-inherited-house-bakersfield/page.js`
- `app/sell-house-needs-repairs-bakersfield/page.js`
- `app/sell-rental-property-bakersfield/page.js`
- `content/situations.js`, `components/SituationGrid.js`, `app/page.js`, `app/globals.css`
- Permanent redirects from the three equivalent inherited/repairs/rental situation URLs; unique vacant and relocating pages remain.

### Educational content

- `content/articles.js`
- `app/insights/page.js`
- `app/insights/[slug]/page.js`
- Three required substantive drafts plus the existing agreement checklist, authoritative California sources, internal links, Article JSON-LD, and explicit draft noindex controls

### Conversion and data protection

- `components/Analytics.js`, `lib/analytics.js`, `components/CTA.js`, `components/Header.js`
- `components/PropertyForm.js`, `app/thank-you/page.js`
- `app/api/leads/route.js`
- Required event taxonomy implemented. The lead success event fires only after a successful server response. The lead reference was removed from the thank-you URL to keep it out of analytics/page URLs. Origin validation now accepts the fixed production origin or the actual same-origin host, preserving safe local and deploy-preview behavior without relying on a mutable SEO environment value.

### Tests, screenshots, and documentation

- `tests/content.test.js`, `tests/e2e/site.spec.js`, `tests/e2e/turnstile.spec.js`
- `playwright.config.js`
- Responsive post-implementation screenshots in `docs/screenshots/*-homepage.png`
- Baseline screenshots in `docs/screenshots/seo-baseline-home-*.png`
- `docs/seo-baseline-audit.md`
- `docs/seo-keyword-map.md`
- `docs/seo-content-approval.md`
- `docs/seo-measurement-plan.md`
- This report

## Technical verification

| Verification | Result |
| --- | --- |
| Permanent canonical origin | Pass. Twenty-one rendered routes use `https://sellmykernhome.com`; no sampled HTML contains the Netlify hostname. |
| Server-rendered indexing gate | Pass. Disabled build emits `noindex, follow` on public pages. |
| Crawl behavior while disabled | Pass. `robots.txt` allows public crawling so bots can see noindex; `/api/` and `/thank-you` are disallowed. |
| Disabled sitemap | Pass. Empty URL set; no draft or non-indexable URL listed. |
| Isolated enabled-gate build | Pass. Approved core pages emitted `index, follow` and canonical sitemap; draft articles and all five unapproved seller pages remained `noindex` and absent. The final local build was rebuilt with the gate off. |
| Netlify hostname redirect | Pass locally. Exact `sellmykernhome.netlify.app` host returns `308` to the matching apex path. A deploy-preview-like hostname remains `200` and is not caught. Live behavior requires deployment verification. |
| Legacy URL redirects | Pass. Inherited, repair, and rental situation equivalents return `308` to their new canonical pages. |
| Metadata | Pass. Twenty-one checked routes had 21 unique titles and descriptions/canonicals where applicable. Canonical public routes use permanent-domain Open Graph URLs/images; the private thank-you route remains noindex. |
| Structured data | Pass. Organization, WebSite, BreadcrumbList, and Article JSON-LD parsed successfully and use only supported claims. No LocalBusiness, review, or FAQ rich-result schema was added. |
| Internal links | Pass. Twenty-five unique internal targets checked with no 4xx/5xx result. |
| Responsive/accessibility | Pass at 375, 390, 430, 768, 1280, and 1440 pixels. No horizontal-overflow regression; Axe found no serious/critical WCAG-tagged violations on the homepage. |
| Seller flow | Pass in isolated tests. Valid submission created one correctly attributed seller lead and notification; insertion preceded notification logging. No real production submission was made. |
| Turnstile negative paths | Pass with Cloudflare official pass, fail, and spent-token test keys. Missing, invalid, expired/spent, and rate-limited attempts produced no lead/notification side effect. |
| Analytics | Pass. Start and exactly one confirmed-success event were observed in the isolated browser test; event parameters contain no seller values. |
| Secret protection | Pass. `.env.local` is untracked; configured privileged values were not found in client bundles; no high-confidence key pattern was found in repository files. |

## Command results

- `npm run check`: pass — lint, 18 automated tests, and production build.
- `npm run test:e2e`: pass — 40 passed, 2 expected mode-specific skips.
- `npm run test:turnstile`: pass across official pass/fail/spent modes; mode-inapplicable tests skipped by design.
- Targeted analytics/success E2E after event assertions: 1 passed.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- `git diff --check`: no whitespace errors; Windows line-ending conversion warnings only.

## Responsive review artifacts

- [375px](screenshots/mobile-375-homepage.png)
- [390px](screenshots/mobile-390-homepage.png)
- [430px](screenshots/mobile-430-homepage.png)
- [768px](screenshots/tablet-768-homepage.png)
- [1280px](screenshots/desktop-1280-homepage.png)
- [1440px](screenshots/desktop-1440-homepage.png)

## Remaining risks and blockers

1. The live site still serves the pre-implementation deployment. Its Netlify-host canonical, crawl-blocking robots policy, and duplicate Netlify-host response will remain until this branch is reviewed and an authorized deployment succeeds.
2. Gabriel must confirm the transaction model, contracting entity, public contact information, and any business/licensing claims. No unsupported claim was added.
3. California legal review is still required for the privacy policy, website terms, optional marketing call/text consent, seller landing pages, and educational article passages identified in `seo-content-approval.md`.
4. All five seller pages and all four articles are intentionally `approvedForIndexing: false`. Approval requires an explicit data-flag change plus the separate global launch gate.
5. GA4 has no committed Measurement ID. Analytics/consent approval and actual GA4/Search Console configuration remain outstanding.
6. Search Console domain-property verification and sitemap submission are not authorized until public indexing is approved.
7. Real-domain Turnstile and end-to-end GNZ Admin behavior were not re-tested because this phase did not authorize a new production lead or email. The isolated suite passed, and the existing production flow was not modified except for the stricter portable origin check.
8. Field Core Web Vitals cannot be validated before deployment and sufficient real-user data. Responsive/browser checks and optimized production compilation passed.

## Safe deployment and launch plan

1. Review the local feature-branch diff and responsive screenshots; do not merge or push unfinished content to an auto-published production branch.
2. Resolve every approval item in `seo-content-approval.md`. Apply content edits and set individual `approvedForIndexing` flags only for approved pages.
3. Keep all Netlify contexts at `NEXT_PUBLIC_ROBOTS_INDEX=false`. Confirm the production `NEXT_PUBLIC_SITE_URL`, if retained for integration diagnostics, is `https://sellmykernhome.com`; canonical generation no longer depends on it.
4. Run `npm run check`, `npm run test:e2e`, `npm run test:turnstile`, dependency audit, secret scan, and an isolated enabled-gate build.
5. With deployment authorization, push the reviewed branch and use a Netlify review deployment first. Do not describe it as private unless Netlify access protection is actually enabled.
6. Verify the review deployment without creating a production lead: canonical, noindex, empty sitemap, redirects, metadata, JSON-LD, internal links, responsive behavior, and client-bundle secret scan.
7. Merge/deploy to production only after review approval. Immediately verify apex HTTPS, `www` redirect, exact Netlify-host redirect, noindex, sitemap gate, form rendering, and error paths.
8. Perform one controlled production inquiry only under separate authorization, label it synthetic, confirm GNZ Admin/source/UTM/notification behavior, and use an explicitly approved cleanup procedure.
9. After a separate public-indexing authorization, set approved content flags, set production `NEXT_PUBLIC_ROBOTS_INDEX=true`, rebuild, verify live directives/sitemap again, then verify the Search Console domain property and submit the sitemap.

Rollback before indexing is non-destructive: redeploy the last known-good application build and leave the database untouched. If an SEO defect is discovered after launch, first set `NEXT_PUBLIC_ROBOTS_INDEX=false` and rebuild, then correct and verify the application; do not change DNS, delete leads, or perform a destructive database rollback.
