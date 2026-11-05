# Sell My Kern Home — SEO Phase 3 audit

Audit date: November 4, 2026 (America/Los_Angeles)<br>
Repository: `SellMyKernHome`<br>
Audited commit: `31f0be8f06472b34a0909102f619a5ab3bf33ea5` (`main`)<br>
Production site: `https://sellmykernhome.com`<br>
Scope: public, read-only competitive research; repository and live-site review; no deployment or production data changes.

## Executive conclusion

Sell My Kern Home has a healthy technical base and a defensible trust position. Fourteen intended public URLs are live, canonical, indexable, and included in the sitemap. Admin and thank-you pages remain noindex, analytics is consent-aware, telephone clicks are PII-safe, and lead completion is counted only after a successful server response.

The primary competitive gap is depth, not page count. Bakersfield competitors use broad situation-page libraries, repeated forms, testimonials, and aggressive promises. SMKH should not imitate unverified cash, fee, offer, licensing, or closing-time claims. Its best near-term opportunity is to make the existing `/sell-your-house-bakersfield` page the most useful neutral comparison of a direct/cash offer and a traditional listing for a Kern County owner. This strengthens a current page, avoids doorway-page risk, and aligns with SMKH's established claim boundaries.

A narrow application patch was implemented locally after the audit: deeper comparison content on the existing Bakersfield options page, clearer local metadata, stronger internal links, and a regression-test selector repair. It has not been committed, pushed, or deployed. The reviewable production patch is documented separately in `docs/seo-phase3-proposed-production-patch.md` and requires owner approval.

## Evidence and limitations

### Observable facts

- Live HTTP responses, metadata, canonical tags, robots directives, sitemap contents, and route behavior were inspected directly.
- Public competitor pages were reviewed without logging in, submitting forms, or accessing private systems.
- Repository implementation and automated tests were reviewed at the audited commit.
- Google guidance and California/Kern County government sources were used for platform, disclosure, and probate statements.

### Not measured or inferred

- No competitor traffic, ranking, search volume, lead count, conversion rate, or backlink count is claimed.
- Search Console and GA4 account data were not available through the repository or an authorized API connection. Ownership, sitemap submission, and live GA4 collection are owner-provided facts; performance metrics below are marked unavailable.
- A public `site:` search sample did not return SMKH results during this review. That is not a reliable index-count measurement and is not treated as proof that zero pages are indexed.
- Competitor Core Web Vitals and field performance were not available. Mobile observations are limited to public layouts, forms, navigation, and visible conversion controls.
- Public review badges, addresses, map links, licensing statements, and transaction claims are reported as claims or visible elements unless independently verified by an authoritative source.

## 1. Existing production audit

### Technical and content eligibility

| Check | Result | Assessment |
| --- | --- | --- |
| Homepage | `200` over HTTPS | Pass |
| `robots.txt` | Allows public crawling, disallows `/api/`, references the apex sitemap | Pass |
| Sitemap | 14 apex-domain URLs | Pass |
| Canonicals | All 14 sitemap URLs have one matching apex canonical | Pass |
| Robots meta | All 14 sitemap URLs emit `index, follow` | Pass |
| Headings | All 14 sitemap URLs have one H1 | Pass |
| Admin | `/admin` redirects to authenticated login; admin pages define `noindex, nofollow, noarchive` | Pass |
| Thank-you | `200` with `noindex, nofollow` | Pass |
| API | `GET /api/leads` returns `405`; APIs are absent from the sitemap | Pass |
| Structured data | Homepage uses factual `Organization` and `WebSite` data, including the approved telephone; no invented address, reviews, or license | Pass |
| Telephone | `(661) 518-2801` is displayed through reusable `tel:+16615182801` links | Pass |
| Form | Two-step, validated, Turnstile-protected seller inquiry remains the primary conversion path | Pass |

The 14 submitted URLs are:

1. `/`
2. `/how-it-works`
3. `/selling-situations`
4. `/about`
5. `/faq`
6. `/contact`
7. `/insights`
8. `/selling-situations/vacant-property`
9. `/selling-situations/relocating`
10. `/sell-your-house-bakersfield`
11. `/sell-house-as-is-bakersfield`
12. `/sell-inherited-house-bakersfield`
13. `/sell-house-needs-repairs-bakersfield`
14. `/sell-rental-property-bakersfield`

### Content and internal-link findings

Strengths:

- Titles, descriptions, and H1s are unique across the 14 submitted pages.
- The homepage links to the selling-options page, situation hub, process, About, FAQ, form, and telephone path.
- Each seller landing page links to related situation/process/contact resources and cites authoritative public sources where legal context is mentioned.
- The as-is, inherited, repair, rental, vacant, and relocation pages have distinct purposes; they are not merely city-name variants.
- Copy does not promise a cash offer, price, fee treatment, representation, or closing deadline.

Confirmed opportunities:

1. `/sell-your-house-bakersfield` identifies the correct comparison factors but is still a short checklist. It does not yet answer the high-intent comparison questions that competitors answer—gross price versus net proceeds, preparation, showings, contingencies, proof of funds, assignment, title/escrow, and cancellation terms.
2. The homepage title, `Sell My Kern Home | A Thoughtful Way to Discuss Your Property`, is trustworthy but less descriptive than the page's actual Bakersfield/Kern County seller purpose.
3. `/selling-situations` has a generic title even though its content is local and differentiated.
4. `/sell-rental-property-bakersfield` covers tenants in the copy, but the title and primary search phrasing do not explicitly say “tenant-occupied.”
5. `/insights` is indexable and in the sitemap while all four linked articles are intentionally noindex drafts. Until at least one reviewed article is approved, the hub has limited standalone depth.
6. The official California Department of Real Estate disclosure booklet linked by several pages is useful general guidance but is an older edition and itself warns that laws change. It should remain a general source, not the sole support for a current legal conclusion.

### Mobile, performance, and accessibility

- The repository covers mobile widths of 375, 390, and 430 pixels, tablet 768, and desktop 1280/1440 in Playwright.
- Existing tests cover responsive telephone controls, form obstruction, phone formatting, consent-aware click tracking, key routes, canonical redirects, accessibility, and both form steps.
- The compact mobile call control is tested not to obscure the inquiry form or other controls.
- The most recent stored mobile Lighthouse lab artifact predates the Phase 3 audit. It reported performance `0.96`, accessibility `1.00`, best practices `1.00`, FCP `0.8 s`, LCP `2.8 s`, CLS `0`, and TBT `40 ms` on a local build. This is historical lab evidence, not current production field data.
- Current production Core Web Vitals are unavailable. Search Console's Core Web Vitals report or CrUX should become the field-data source once enough traffic exists.

## 2. Competitor SEO comparison

The comparison below records public observations, not endorsements or verified business-performance claims.

| Site | Public architecture and intent coverage | Conversion flow | Trust/claim strategy | SMKH implication |
| --- | --- | --- | --- | --- |
| [Central Valley Real Estate Investments](https://cenvalrei.com/) | Home, process, why-us, contact, blog, and visible pages for as-is, foreclosure, inherited/probate, divorce, rental, damage, relocation, liens, and hoarder properties | Address/name/phone/email form above the fold, repeated telephone and “cash offer” CTAs, separate transactional and marketing SMS consent | Publicly claims direct cash buying, no fees/commission/repairs, offers often within 24 hours, and closing in as little as seven days | Strong exact-intent coverage and repeated conversion paths; SMKH should match usefulness and navigation, not copy unverified promises |
| [Bakersfield Home Solutions](https://www.bakersfieldhomesolutions.com/) | Nine visible situation programs plus process, situation hub, and about pages | Prominent nine-step form beginning with address and optional value; repeated call/text CTAs | Publicly displays a Bakersfield address/map link, local positioning, disclaimers, and direct-sale claims | Demonstrates strong situation navigation and progressive form UX; a map link is not independent proof of a valid Google Business Profile |
| [Harbison Buys Homes](https://www.callharbison.com/) | Process, situations, inherited-property path, guides, about, contact, Spanish navigation, and comparison-oriented educational content | Short multi-step options form plus call/text controls | Publicly names an operator and DRE number and presents direct sale, listing, renovation, development, and “not ready” alternatives | Best editorial benchmark for transparent option comparison; SMKH cannot reuse licensing or service claims without its own verification |
| [Kernvestors](https://kernvestors.com/) | Long homepage covers repairs, foreclosure, inheritance, tenants, damage, and purchase examples | Address/phone form and repeated cash-offer CTAs | Publicly uses review badges, local/experience language, “no fees,” and fast-close claims | Shows the competitive prevalence of proof and speed claims, but also why SMKH's substantiated, lower-pressure position matters |
| [Capitol Buys Houses — Bakersfield](https://www.capitolbuyshouses.com/where-we-buy/sell-your-house-bakersfield/) | Long Bakersfield location page with neighborhood references, situations, process, reviews, FAQ, and internal location links | Repeated phone/property forms and offer CTAs | Publicly acknowledges that a cash price may differ from a market sale while also making speed/cost claims | Useful model for original local depth; avoid templated city pages and unsupported market statements |

### Competitive patterns

- **Architecture:** competitors commonly maintain eight or more situation pages. SMKH already covers the highest-value non-legal-sensitive situations and should deepen them before adding more.
- **Titles/headings:** competitors repeatedly place “sell,” “Bakersfield,” “fast,” “cash,” and the situation in titles/H1s. SMKH can safely improve descriptive local phrasing but should not use “cash buyer” or “fast” as a service claim until its transaction role and capabilities are verified.
- **Original local content:** competitors frequently add neighborhood names and local-market assertions. SMKH should add only genuinely useful Kern County process/resources, not generic neighborhood keyword lists or unsourced market claims.
- **Forms and phone:** every reviewed competitor makes form and telephone conversion prominent. SMKH already does this while using a shorter two-step form, server validation, Turnstile, and explicit privacy controls.
- **Trust:** competitors use testimonials, addresses, staff identities, licenses, purchase examples, or review badges. SMKH currently avoids fabricating these. Real team/role information, verified credentials, and authentic customer proof could be added later only when documented and approved.
- **Backlinks/citations:** no defensible public backlink counts were available. Business-site map links and review badges were observable, but they do not establish profile ownership, review authenticity, or backlink authority. A paid SEO-index estimate is deliberately not substituted for evidence.
- **Mobile/performance:** the public sites expose responsive navigation, forms, and telephone controls, but no comparable field Core Web Vitals were available. No performance winner is claimed.

Central Valley REI also appears to operate a separate investor-facing domain, `centralvalleyreideals.com`. That audience differs from the homeowner-facing `cenvalrei.com`; the two should not be treated as a single landing-page architecture without ownership confirmation.

## 3. Keyword-to-page opportunity map

These are intent hypotheses, not search-volume or ranking estimates.

| Search intent | Current/best page | Coverage | Recommended action |
| --- | --- | --- | --- |
| sell my house fast Bakersfield | `/sell-your-house-bakersfield` | Partial | Address urgency and decision factors without promising speed; use “fast” only in explanatory copy such as “what can affect timing,” not as a guaranteed service claim |
| cash home buyers Bakersfield | `/sell-your-house-bakersfield` | Guarded gap | Provide a neutral direct/cash-offer versus listing comparison; do not claim SMKH is a cash buyer until the operating role is verified |
| sell house as-is Bakersfield | `/sell-house-as-is-bakersfield` | Strong | Deepen only where Search Console shows query demand or unanswered questions |
| sell inherited house Bakersfield | `/sell-inherited-house-bakersfield` | Strong landing page; article draft | Keep current page; retain the detailed article as noindex until owner/legal review |
| sell house without realtor Bakersfield | `/sell-your-house-bakersfield` | Partial | Explain that direct transactions and represented/listed transactions have different roles and costs; do not imply that professional advice is unnecessary |
| sell vacant property Kern County | `/selling-situations/vacant-property` | Strong content; title can improve | Use “Bakersfield and Kern County” consistently in title/meta and add a relevant link from the broad comparison page |
| sell house needing repairs Bakersfield | `/sell-house-needs-repairs-bakersfield` | Strong | Preserve separation from as-is page; use repair-scope/net-outcome questions |
| sell rental property with tenants Bakersfield | `/sell-rental-property-bakersfield` | Strong body; title can improve | Add “tenant-occupied” to title/description and keep legal claims general with current California resources |
| sell house in foreclosure Kern County | `/selling-situations` pending reviewed content | Gap; legal-sensitive | Do not create a thin foreclosure landing page. Require owner/legal review and authoritative California/HUD sources before publication |
| compare cash offer vs listing Bakersfield | `/sell-your-house-bakersfield` | Highest-value gap | Priority: expand the existing page into a neutral decision guide and worksheet |

### Cannibalization controls

- Homepage: brand plus broad Kern County seller entry point.
- `/sell-your-house-bakersfield`: detailed method comparison and decision intent.
- As-is page: condition, disclosures, inspections, and repair choices.
- Repairs page: scope, estimates, project risk, and net-outcome planning.
- Inherited page: authority, title, family, records, and professional questions.
- Rental page: leases, occupants, deposits, access, records, and tenant considerations.
- Vacant page: security, insurance, utilities, upkeep, and access.

Do not create city/ZIP variants or substantially similar situation pages. Google identifies pages created to rank for similar queries and funnel users onward as doorway abuse, and it treats large volumes of low-value or unoriginal pages as scaled-content abuse.

## 4. Search Console and measurement baseline

Search Console is verified and the sitemap has been submitted according to the owner, but the repository has no Search Console API integration or authorized export. Account metrics could not be retrieved programmatically in this audit.

| Baseline metric | Value on November 4, 2026 | Source/status |
| --- | --- | --- |
| Live sitemap URLs | 14 | Direct production inspection |
| Technically indexable sitemap URLs | 14 | Direct metadata/canonical/response inspection |
| Google-indexed URLs | Unavailable | Requires Search Console Page Indexing/URL Inspection |
| Organic impressions | Unavailable | Requires Search Console Performance export |
| Organic clicks | Unavailable | Requires Search Console Performance export |
| Organic CTR | Unavailable | Requires Search Console Performance export |
| Average position by query/page | Unavailable | Requires Search Console Performance export |
| Organic form inquiries | Unavailable | Requires GA4 acquisition plus SMKH lead reconciliation |
| Organic telephone inquiries | Unavailable | Current GA4 records consented telephone clicks, not completed calls |
| Qualified seller leads | Unavailable | Requires SMKH Admin status baseline and an agreed qualification definition |
| Organic conversion rate | Unavailable | Requires consistent session, lead, and qualification windows |

### Baseline export required after owner access is available

Use the Search Console domain property's Search Results report and export:

1. Launch-to-date and trailing 28 days, with the prior 28 days as the comparison when available.
2. Web search only, then query, page, device, and country dimensions.
3. Clicks, impressions, CTR, and average position.
4. A filtered view for the ten Phase 3 intents and a page view for all 14 sitemap URLs.
5. Page Indexing, Sitemaps, Core Web Vitals, HTTPS, manual actions, and security issues status.

Google defines Search Console clicks, impressions, CTR, and average position and notes that results vary by time, location, device, and user history. Average position should be treated as directional, not as a fixed rank.

## 5. Content opportunities — maximum three

### Priority 1 — improve an existing page

**Cash/direct offer versus traditional listing in Bakersfield**

Target: expand `/sell-your-house-bakersfield`, not a new URL.

Add a neutral comparison covering:

- likely gross price versus estimated net proceeds;
- preparation, repairs, cleaning, showings, and access;
- buyer financing/proof of funds and appraisal risk;
- inspection, title, approval, and other contingencies;
- commissions, closing costs, credits, and other transaction expenses only as property-specific questions, not fixed promises;
- assignment/resale language and the identity/role of each party;
- deposit, cancellation rights, possession, and written closing conditions;
- a downloadable/printable comparison checklist only if it contains no lead data or tracking identifiers.

This is educational content, not a statement that SMKH makes cash offers or provides brokerage services.

### Priority 2 — review and eventually publish an existing draft

**Selling an inherited property in Kern County**

Target: existing noindex draft `/insights/selling-inherited-property-kern-county`.

Keep noindex until an owner/legal review confirms current authority, probate, tax, occupant, and professional-referral language. Retain direct links to California Courts and Kern County Superior Court. Do not state that probate is always or never required.

### Priority 3 — one justified future resource

**Understanding selling costs and closing timelines in Bakersfield**

Potential new URL only after sources and operating role are approved.

Use a worksheet based on seller-specific estimates rather than generic percentages or promised dates. Explain which items can vary—preparation, carrying costs, professional compensation, credits, title/escrow, taxes, financing, appraisal, inspection, possession, and third-party timing. Do not publish a guaranteed cost or closing-time comparison.

No new foreclosure, probate, tenant, or neighborhood doorway pages are recommended in the initial patch.

## 6. Local authority plan

### Google Business Profile eligibility

Eligibility is not established by owning a domain or answering calls. Google's current rules allow a profile when a business has a physical location customers can visit or travels to customers. The business must be represented as it exists in the real world, use accurate service areas, and generally maintain one profile. Virtual offices are not eligible unless actually operated, staffed, signed, and able to receive customers under Google's rules.

For SMKH:

- If SMKH has a real staffed customer-facing location with permanent signage, document it before creating a profile.
- If SMKH genuinely travels to sellers at their locations from a legitimate central base, a service-area profile with the non-customer-facing address hidden may be eligible.
- If SMKH is online-only lead generation/referral and does not meet customers in person, do not create a profile.
- Do not use a mailbox, virtual office, coworking address, Workside address, or home address merely to gain map visibility.
- Do not create a profile until the public business name, real-world operation, address/service-area model, and appropriate category are documented consistently.

### Legitimate citations and earned links

1. Establish consistent public business identity and telephone data only after the GBP/business-model decision. Do not publish a private address.
2. Seek chamber or local business-directory membership only when SMKH genuinely qualifies and the listing accurately describes the operation.
3. Build real referral relationships with Kern County attorneys, tax professionals, title/escrow providers, contractors, housing counselors, and estate professionals. Links or mentions should arise from genuine collaboration, not payment for ranking.
4. Offer the neutral seller comparison worksheet and Kern-specific decision resources to relevant local organizations as useful references.
5. If actual customers later provide feedback, request reviews without incentives, filtering, scripts, or fabricated transactions and follow the platform's review rules.
6. Do not buy backlink packages, exchange sitewide keyword links, create fake local profiles, or mass-produce city pages.

## 7. Organic conversion measurement plan

### Existing implementation

- Consent defaults to denied before the Google tag is loaded.
- The tag loads only after consent; denial and withdrawal keep collection disabled and remove `_ga` cookies where possible.
- App Router page views are explicit, path-only, and deduplicated; automatic page views are disabled.
- `/admin` routes are excluded from analytics.
- `primary_cta_click`, `phone_click`, `email_click`, `seller_form_start`, `seller_form_validation_error`, `form_step`, `seller_form_submit_success`, and `generate_lead` use an allowlist of PII-safe parameters.
- `generate_lead` fires only after a successful server response and not for an idempotent duplicate.
- The landing URL stored with the lead is origin plus pathname; seller PII is not placed in the public URL.

### Reporting model

Do not add a redundant `organic_landing` event. Derive organic landing sessions in GA4 using `Session default channel group = Organic Search`, landing page, and the existing explicit `page_view`. This avoids duplicate acquisition events.

| Funnel stage | Metric/source | Counting rule |
| --- | --- | --- |
| Search exposure | Search Console impressions/clicks/CTR/position | Query and page views; report device separately |
| Organic landing | GA4 organic sessions by landing page | Consented analytics only; no seller data |
| Engagement | CTA and telephone clicks | One event per actual click; not a lead |
| Form start | `seller_form_start` | Once per mounted form |
| Form progress | `form_step` and validation error | Diagnostic only |
| Web inquiry | `generate_lead` plus SMKH lead row | Database is authoritative; mark only `generate_lead` as the GA4 key event |
| Qualified lead | SMKH Admin status | Define qualification criteria before publishing a KPI |
| Telephone inquiry | Future Merxus operational record | A `phone_click` is intent, not proof of a completed call |

### Privacy-safe future Merxus attribution

Preserve the official number. If Merxus later supports an authorized webhook or campaign metadata, record only a non-PII campaign/landing identifier, timestamp, call connection/outcome category, and consent state in a server-side operational system. Do not send caller number, transcript, address, name, or seller details to GA4. Reconcile aggregate connected/qualified call counts to campaigns outside GA4; use `phone_click` only as the web-intent signal. Any dynamic-number insertion proposal needs separate privacy, consent, accessibility, and call-routing review.

## 8. Prioritized improvements

### P0 — measurement evidence

- Export Search Console baselines and record indexed/valid/excluded counts.
- Confirm `generate_lead` is the only primary web-lead key event in GA4.
- Create a weekly query/page dashboard using exported data; do not introduce a new database or paid service.

### P1 — approved production patch

- Expand the existing Bakersfield selling-options page into the direct/cash-offer versus listing decision guide.
- Improve the homepage and situation-hub titles without changing approved claims.
- Make tenant-occupied and Kern County vacant intent more explicit on the existing appropriate pages.
- Temporarily remove the thin Insights hub from the sitemap and make it noindex while every child article remains a noindex draft; restore it when at least one reviewed article is approved.
- Add tests for the revised titles, canonicals, internal links, sitemap gating, and claim guardrails.

### P2 — reviewed content and authority

- Review the inherited-property draft against current official sources and legal boundaries.
- Decide GBP eligibility based on the actual operating model.
- Pursue accurate local citations and earned links through real participation and useful resources.

## 9. Thirty-day execution schedule

| Window | Work | Evidence/KPI |
| --- | --- | --- |
| Days 1–3 | Export Search Console launch-to-date and 28-day data; inspect all 14 URLs; record GA4 organic landing/form/phone-click baseline; define “qualified” | Baseline workbook/report with unavailable fields explicitly marked |
| Days 4–7 | After owner approval, implement the narrow existing-page patch, run all checks, review copy, and deploy through the established production workflow | Passing lint/tests/build/browser checks; canonical/sitemap/metadata diff; no new claims |
| Days 8–14 | Request recrawl for materially updated URLs; monitor indexing, crawl, CWV, and GA4 funnel; review form validation exits by device | No indexing/security regression; valid pages and funnel counts tracked |
| Days 15–21 | Owner/legal review of inherited draft; validate GBP operating-model eligibility; prepare one accurate local resource/citation outreach list | Written approval status; no profile created without eligibility; outreach prospects tied to real relationships |
| Days 22–30 | Compare Search Console query/page/device results with baseline; reconcile organic web leads and aggregate phone outcomes; prioritize the next single content update | Trends reported without fabricated targets; qualified-lead and conversion definitions applied consistently |

KPIs for the first 30 days are measurement completeness, zero unexpected index/security regressions, indexed-page coverage, query/page impressions and clicks, CTR, organic sessions, form starts, `generate_lead`, telephone clicks, connected organic calls when attribution exists, qualified leads, and organic conversion rate. Numeric growth targets should be set only after a real baseline exists.

## 10. Claims requiring owner or legal review

- Whether SMKH or an operating partner is a direct buyer, intermediary, licensee, brokerage, or another role.
- Any use of “cash buyer,” “we buy houses,” “offer,” “no fees,” “no commission,” “we pay closing costs,” or a fixed response/closing time.
- Any public license, person, office, storefront, transaction, review, rating, or customer-count claim.
- Foreclosure, probate, tax, tenant-rights, notice, possession, relocation, or legal-deadline guidance beyond linking to general authoritative information.
- Google Business Profile eligibility and any address/service-area representation.

## 11. Verification report

No production resource, environment setting, database, lead, DNS record, email configuration, commit, push, or deployment was changed. The local patch changes only public content/metadata presentation, CSS, and regression tests plus the two Phase 3 documents. The unrelated `docs/Merxus_AI_Prompt/` folder was not modified.

| Check | Result |
| --- | --- |
| `npm run lint` | Pass |
| `npm test` | Pass — 38/38 tests in the approved release patch |
| `NEXT_PUBLIC_ROBOTS_INDEX=true npm run build` | Pass — Next.js 16.4.1 production build generated 29 routes/pages |
| Site E2E, mobile 390 | Pass — 8/8 non-screenshot checks, including routes, comparison content, redirects, indexing gate, form, telephone formatting, and accessibility |
| Site E2E, desktop 1280 | Pass — 8/8 non-screenshot checks |
| Analytics/phone E2E, mobile and desktop | Pass — 10/10, including consent, withdrawal, explicit page views, admin exclusion, noindex headers, responsive telephone controls, and one PII-safe event per click |
| Admin E2E, mobile and desktop | Pass — 4/4 after the local test selector was narrowed to the password textbox |
| Live production route sample | Pass — homepage `200`, robots and sitemap `200`, admin redirects to login, thank-you noindex, leads API rejects GET |

The initial Admin browser-test failure was a test selector ambiguity introduced by the accessible password-visibility control, not evidence that authentication failed. The patch includes only the narrow selector repair so Admin behavior can be verified without changing application authentication.

One mobile all-routes sweep exceeded its 30-second timeout while mobile and desktop projects were compiling routes concurrently. Every logged response was successful; the same mobile sweep passed in isolation in 21.1 seconds. This is recorded as test-environment load, not a route failure. In total, all 30 targeted mobile/desktop site, comparison, analytics, telephone, noindex, accessibility, and Admin scenarios passed after the isolated rerun.

## Authoritative references

- [Google Search Essentials](https://developers.google.com/search/docs/essentials)
- [Google Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Google Business Profile representation guidelines](https://support.google.com/business/answer/3038177?hl=en)
- [Google Search Console Performance report definitions](https://support.google.com/webmasters/answer/7576553?hl=en)
- [Google Organization structured-data guidance](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [California Department of Real Estate — Disclosures in Real Property Transactions](https://www.dre.ca.gov/files/pdf/re6.pdf)
- [California Courts — Guide to property after someone dies](https://selfhelp.courts.ca.gov/wills-estates-probate)
- [Kern County Superior Court — Probate](https://www.kern.courts.ca.gov/divisions/probate)
