# Sell My Kern Home — proposed SEO Phase 3 production patch

Status: **owner-approved production patch; deployment verification belongs to the release commit/report**<br>
Prepared: November 4, 2026<br>
Baseline commit: `31f0be8f06472b34a0909102f619a5ab3bf33ea5`

## Patch objective

Improve high-intent Bakersfield seller relevance by deepening existing pages and making metadata more descriptive, without changing SMKH's operating claims, application architecture, form, analytics, Supabase integration, or security controls.

## Proposed file changes

| File | Proposed change | Risk control |
| --- | --- | --- |
| `app/layout.js` | Change the default homepage title to descriptive Bakersfield/Kern County seller language | Do not use “cash,” “fast,” “offer,” or a guaranteed outcome |
| `app/page.js` | Use the approved seller-inquiry and property-opportunity service description in visible copy and factual Organization data | Explicitly avoid buyer, brokerage, contract, or outcome implications |
| `app/about/page.js` | State the approved business role and its limits | Explicitly deny licensed-brokerage, guaranteed-cash-buyer, and contracting-party representations |
| `content/seller-pages.js` | Expand `/sell-your-house-bakersfield` with a neutral direct/cash-offer versus listing decision matrix; add “tenant-occupied” phrasing to the existing rental page metadata | Describe questions and tradeoffs, not SMKH services that have not been verified |
| `components/SellerLandingPage.js` | Render an optional, accessible comparison section from page data | Reuse current design/data architecture; no redesign or new dependency |
| `app/globals.css` | Style the semantic comparison table with keyboard-visible horizontal scrolling on narrow screens | Preserve document-level mobile width and form usability |
| `content/situations.js` | Make the vacant-property title explicitly cover Bakersfield and Kern County | Preserve the current canonical URL and avoid duplicate regional pages |
| `app/selling-situations/page.js` | Use a more descriptive local title/H1 introduction | No new route or claim |
| `tests/content.test.js` | Add title, claim, article-approval, sitemap, and source guardrails | Fail if unapproved promises or draft indexing are introduced |
| `tests/e2e/site.spec.js` | Verify the comparison table, local title, mobile/desktop rendering, and accessibility | No production data or form submission |
| `tests/e2e/admin.spec.js` | Target the password textbox explicitly after the visibility button made the old label selector ambiguous | Test-only repair; authentication implementation is unchanged |
| `docs/seo-*` | Update the current map and measurement baseline after actual Search Console export | Mark unavailable metrics; never invent performance data |

## Proposed comparison content

The existing `/sell-your-house-bakersfield` page should compare the questions an owner needs answered rather than declare a winner:

| Decision factor | Traditional market listing | Direct/cash proposal |
| --- | --- | --- |
| Price comparison | Ask for a market analysis and estimate net proceeds after preparation, compensation, concessions, and closing expenses | Ask how the price was calculated and compare it with independent value evidence and total deductions |
| Preparation/access | Clarify repairs, cleaning, staging, photography, showings, inspections, and occupancy needs | Clarify walkthroughs, inspections, access, cleanup, and any later price-adjustment rights |
| Certainty | Review financing, appraisal, inspection, sale, and other contingencies | Verify buyer identity, proof of funds or financing, due diligence, title conditions, assignment, and cancellation rights |
| Timing | Record preparation, marketing, contract, financing, title, and possession dependencies | Record due-diligence, title, funding, approval, and possession dependencies; do not rely on a verbal date |
| Professional roles | Identify the broker/agent, duties, compensation, and representation | Identify the buyer and every representative/intermediary; verify any claimed license or agency role |
| Written outcome | Request a seller net sheet and review the complete agreement | Request a written proposal and seller net estimate; review deposits, costs, credits, assignment, and remedies |

Required language:

- “A higher headline price is not always a higher net result, and a shorter proposed timeline is not guaranteed until the written conditions and third-party steps are understood.”
- “Sell My Kern Home provides a property-inquiry starting point. This comparison does not state that SMKH is a cash buyer, brokerage, attorney, tax adviser, or contracting party.”

## Content explicitly excluded

- No cash-offer or purchase promise.
- No response or closing deadline.
- No fee, commission, cost, or net-proceeds promise.
- No licensing, brokerage, attorney, tax, or fiduciary claim.
- No invented reviews, transactions, staff, office, business address, or Google Business Profile.
- No foreclosure page.
- No new probate or tenant-rights article.
- No neighborhood, city, or ZIP doorway pages.
- All four current articles remain `approvedForIndexing: false`.

## Verification gate before any deployment

1. Review the diff and confirm that only the approved files are included; preserve `docs/Merxus_AI_Prompt/` untouched.
2. Run `npm run lint`.
3. Run `npm test`.
4. Run `npm run build` with the production indexing configuration.
5. Run targeted Playwright tests for site, analytics, phone, and admin behavior at mobile and desktop widths.
6. Confirm all approved public routes have one H1, one self-referencing apex canonical, and the intended robots directive.
7. Confirm `/admin`, `/api`, and `/thank-you` remain protected/noindex and all four article drafts remain absent from the sitemap and noindex.
8. Confirm GA4 consent defaults denied, admin remains excluded, explicit page views do not duplicate, and no PII appears in analytics payloads.
9. Confirm Turnstile, rate limiting, lead validation, PI Supabase routing, notification configuration, security headers, and the inquiry form are unchanged.
10. Deploy only after owner approval, then verify the live metadata, sitemap, links, form rendering, telephone links, and unauthorized admin denial without creating a production lead.

## Rollback

This patch would contain content, metadata, rendering, and tests only. Roll back by reverting the approved patch commit through the existing GitHub/Netlify workflow. No database, DNS, environment, lead, email, or external-resource rollback would be required.
