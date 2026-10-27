# Sell My Kern Home SEO and conversion measurement plan

## Measurement principles

- Treat rankings and traffic as diagnostic indicators, not business outcomes.
- Count a lead conversion only after `POST /api/leads` returns success. A form start, validation event, Turnstile completion, or button click is not a lead.
- Never send name, property address, email, telephone, comments, seller reference, Turnstile token, or other PII to analytics.
- Preserve UTM/referrer values in the existing trusted lead flow for authorized GNZ Admin review; do not duplicate personal lead data into GA4.
- GA4 remains inactive until a genuine Measurement ID and any required consent approach are approved.

## Event specification

| Event | Trigger | Allowed parameters | Counting rule |
| --- | --- | --- | --- |
| `seller_form_start` | First user change in the seller form | `form` | At most once per mounted form. |
| `seller_form_validation_error` | Client required-field validation fails or server returns field validation errors | `form`, `step`, `error_count`, `source` | Diagnostic only; never a conversion. No field values or field-specific PII. |
| `seller_form_submit_success` | Server returns an accepted lead result after validation, Turnstile, rate limiting, and database handling | `form` | Primary web lead event. Fires before navigation and only on a successful response. |
| `primary_cta_click` | Click on a marked primary seller-form CTA | `location`, `destination` | Engagement only. Destination is path-only. |
| `phone_click` | Click on a `tel:` link if an approved number is later added | `location` | Engagement only; the telephone value is not sent. |
| `email_click` | Click on a `mailto:` link if an approved address is later added | `location` | Engagement only; the address is not sent. |

The analytics helper removes parameter keys matching common PII names as a second-line safeguard. No current public phone/email link is invented solely to generate those events.

## Funnel and business reporting

| Layer | Metrics | Source | Interpretation |
| --- | --- | --- | --- |
| Search visibility | Impressions, clicks, CTR, average position, indexed pages | Google Search Console domain property | Whether approved pages are discoverable for relevant queries. Position is directional and query/location dependent. |
| Site acquisition | Organic users/sessions, landing pages, engaged sessions | Approved analytics platform | Whether search visits reach relevant experiences. |
| Form behavior | Form starts, validation errors, primary CTA clicks | GA4 events above | Friction and engagement, not lead quality. |
| Confirmed web leads | Successful seller form submissions | Server success event and GNZ Admin lead record | Primary conversion. Reconcile analytics with database records; the database is authoritative. |
| Qualified inquiries | Seller leads judged relevant and contactable | GNZ Admin status/workflow | Business-quality measure; define qualification criteria before reporting. |
| Downstream outcomes | Contacted, appointment/next step, not proceeding, and other approved GNZ statuses | GNZ Admin | Measures operational outcomes without making public transaction claims. |

Suggested review cadence after launch: weekly technical/search checks for the first month, monthly content/funnel review thereafter, and quarterly content accuracy/legal review.

## GA4 setup checklist (after approval)

1. Obtain the actual GA4 web data-stream Measurement ID; never create or guess one in source.
2. Approve the consent/privacy approach and configure the production Netlify variable without committing it.
3. Verify DebugView using non-PII local or protected-preview interactions.
4. Mark only `seller_form_submit_success` as the primary lead conversion.
5. Confirm event parameters contain no PII and that a failed/blocked request does not fire success.
6. Configure internal/developer traffic filtering where appropriate.
7. Reconcile a controlled, separately authorized synthetic lead with GNZ Admin, then follow an explicitly approved cleanup process.

## Search Console and indexing checklist (after separate launch authorization)

1. Confirm all business/legal/content approvals in `seo-content-approval.md`.
2. Mark only approved seller pages/articles `approvedForIndexing: true`.
3. Run an isolated production build with `NEXT_PUBLIC_ROBOTS_INDEX=true`; review robots meta, sitemap contents, canonical URLs, redirects, and structured data.
4. Deploy with the permanent apex as the primary Netlify domain. Confirm `www` and exact Netlify-production-host redirects without affecting deploy previews.
5. Confirm live public pages return `index, follow`; private, API, thank-you, legal-draft, and editorial-draft pages remain excluded/noindex.
6. Verify the Google Search Console **Domain property** `sellmykernhome.com` through the existing DNS owner. Do not change DNS without explicit authorization.
7. Submit `https://sellmykernhome.com/sitemap.xml` only after the indexing gate is enabled and its contents are approved.
8. Inspect representative URLs and monitor coverage, canonical selection, structured-data errors, and crawl anomalies. Do not promise indexing or ranking timing.
