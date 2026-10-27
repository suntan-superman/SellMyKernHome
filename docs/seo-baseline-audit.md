# Sell My Kern Home SEO baseline audit

Audit date: October 14, 2026 (America/Los_Angeles)  
Repository baseline: `0d2fb3d1c70a9ddba533b60a9b681f2b10be4cb9`  
Production canonical requested: `https://sellmykernhome.com`

## Application and deployment inventory

- Next.js 16.4.1, React 19, JavaScript, App Router.
- Netlify build command: `npm run build`; publish directory: `.next`.
- Git remote: `suntan-superman/SellMyKernHome`; current production changes appear to publish from the connected repository. Work for this phase is isolated on local branch `codex/phase2-seo-permanent-domain` and has not been pushed or deployed.
- Existing public routes at baseline: `/`, `/about`, `/contact`, `/faq`, `/how-it-works`, `/selling-situations`, five dynamic situation pages, `/insights`, two dynamic insight pages, `/privacy-policy`, `/terms`, and `/thank-you`.
- Existing server route: `POST /api/leads` with schema validation, honeypot/time checks, Turnstile Siteverify, database-backed rate limiting, server-only Supabase insert, and post-insert notification handling.
- Existing attribution: landing URL, referrer, and `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, and `utm_term` are submitted to the trusted server flow.
- Existing analytics: optional GA4 loader controlled by `NEXT_PUBLIC_GA_MEASUREMENT_ID`; the repository contains no Measurement ID. Existing event names did not match the required measurement plan.
- Existing assets use Next Image and hosted Google fonts through `next/font`. Responsive breakpoints are 540, 800, and 1050 pixels.

## Read-only production observations

| Check | Baseline observation |
| --- | --- |
| Apex HTTPS | `https://sellmykernhome.com/` returned `200` over HTTPS. |
| `www` | `https://www.sellmykernhome.com/` returned `301` to the apex. |
| Netlify hostname | `https://sellmykernhome.netlify.app/` returned `200`, creating a second reachable copy. |
| Canonical | Apex HTML emitted `https://sellmykernhome.netlify.app` as canonical. |
| Robots meta | No server-rendered robots meta directive was found on the sampled homepage. |
| `robots.txt` | Returned `Disallow: /`, preventing crawlers from seeing a page-level `noindex`. |
| Sitemap | Was available while indexing was disabled and listed Netlify-hostname URLs. |

These checks were read-only. No production form submission, DNS change, Netlify change, or database operation was performed.

## Baseline screenshots

- [390px homepage](screenshots/seo-baseline-home-mobile-390.png)
- [1280px homepage](screenshots/seo-baseline-home-desktop-1280.png)

## Baseline test results

- `npm run lint`: pass.
- `npm test`: pass, 15 tests.
- A separate pre-edit production build was not run; the final implementation is verified with a fresh production build and the result is recorded in the implementation report.

## Findings and remediation plan

| Priority | Issue | Evidence/file | Impact | Implemented fix |
| --- | --- | --- | --- | --- |
| Critical | Wrong canonical origin | Live apex HTML and `app/layout.js` used `NEXT_PUBLIC_SITE_URL`, which was deployed as the Netlify host. | Search engines could consolidate the permanent domain into the temporary host. | A fixed production origin is used for canonical, Open Graph, sitemap, and JSON-LD URLs. |
| Critical | Disabled indexing was not expressed in HTML | `app/robots.js` blocked `/`; `app/layout.js` had no robots metadata. | Crawlers could not reliably discover a `noindex` directive. | The root metadata now emits server-rendered `noindex, follow`; `robots.txt` permits public crawling while excluding API and thank-you routes. |
| High | Duplicate Netlify hostname | Netlify hostname returned the same `200` content. | Duplicate crawlable property and inconsistent canonical signals. | Exact production Netlify host receives a permanent apex redirect; deploy-preview hostnames are not matched. |
| High | Sitemap ignored the indexing/content gate | `app/sitemap.js` always listed all pages and drafts. | Draft and non-indexable pages could be submitted accidentally. | Disabled indexing returns an empty sitemap; enabled mode includes only explicitly approved canonical content. |
| High | Form origin depended on a mutable SEO environment value | `app/api/leads/route.js` compared Origin only with `NEXT_PUBLIC_SITE_URL`. | An obsolete hostname could reject valid apex submissions. | Strict same-origin or fixed production-origin validation replaces the environment coupling. |
| Medium | Required seller intents lacked dedicated differentiated pages | Route inventory. | Broad, as-is, inherited, repair, and rental searches shared generic situation content. | Five intent-specific pages reuse the design system; three replaced situation URLs redirect permanently. |
| Medium | Draft article handling was incomplete | Insight pages displayed a public review notice and were always placed in the sitemap. | Editorial status leaked into the experience and drafts could become indexable. | Draft status is metadata/data driven, drafts are `noindex`, and approval work is documented separately. |
| Medium | Structured data used a mutable/obsolete origin and FAQ rich-result markup | `app/page.js`, `app/faq/page.js`. | Inaccurate URLs and unjustified rich-result targeting. | Added factual Organization/WebSite/Breadcrumb/Article data and removed FAQPage markup. No LocalBusiness or review schema is used. |
| Medium | Analytics event taxonomy did not match the acquisition funnel | `components/Analytics.js`, `components/PropertyForm.js`. | Funnel reporting could not reliably separate starts, validation failures, and confirmed leads. | Required event names and safe, non-PII parameters are implemented. Success fires only after an accepted server response. |
| Low | Public copy contained conspicuous internal approval notes | Homepage, About, FAQ, Contact, footer, legal pages, and form consent copy. | Reduced trust and mixed internal review state with visitor content. | Visitor copy is neutral and accurate; unresolved approvals are recorded in `seo-content-approval.md`. |

## Preserved controls

The Supabase schema, RLS, GNZ Admin permissions, Turnstile verification, replay protection, rate limiting, server-side validation, insert-before-notification sequence, and lead source/UTM mapping were not removed or bypassed. Automated browser tests continue to use the local mock service and official Turnstile test keys.
