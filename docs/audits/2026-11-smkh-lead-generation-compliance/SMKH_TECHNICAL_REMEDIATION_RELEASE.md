# SellMyKernHome Technical Compliance Remediation Release

**Release date:** November 9, 2026 (America/Los_Angeles)

**Implementation commit:** `1f681fe2f092bad0b1d114d0b719f12a883cb1b5`

**Netlify production deploy:** `6af2955687b8d19c263f3a6c`

**Production origin:** `https://sellmykernhome.com`

**Result:** Released and verified, with the external legal and live-Merxus decisions listed below still open.

## Changes by finding

| Finding | Remediation |
| --- | --- |
| F-01 | Replaced the repository Merxus draft with a Workside-operated homeowner-inquiry/lead-generation role. Removed acquisition, offer-maker, buyer, representation, appointment, matching, pricing, and outcome implications. |
| F-02 | Kept external sharing disabled. Public/form copy says inquiries remain with authorized SMKH administrators, and new consent JSON explicitly records `external_sharing_consent: false`. No recipient, export, webhook, or partner route was added. |
| F-03 | Added the required AI identity and limited-role opening to the prepared prompt. The prompt does not authorize recording or transcription. Live prompt, recording/transcription, storage, retention, and recipients remain **NOT VERIFIED**. |
| F-04 | Expanded the privacy policy with the Workside operator identity, current first-party purposes/providers, an existing contact/telephone request route, verification and retention criteria, and no unsupported CCPA determination. Added internal privacy-request and retention procedures. |
| F-05 | Replaced the draft consent identifier with immutable privacy and marketing versions. Exact source-controlled notice text is linked to deterministic SHA-256 hashes, server-validated, and stored in the existing consent JSON with type, time, source, and choice evidence. Existing records are not rewritten. |
| F-06 | Narrowed optional marketing language so it does not authorize automated, prerecorded, artificial-voice, or outside-party marketing. No SMS or marketing automation was enabled. Further technology/channel consent remains a legal decision. |
| F-07 | Homepage JSON-LD now identifies Workside Software as the Organization/operator and Sell My Kern Home as its brand/alternate name without inventing a license, brokerage, or address. |
| F-08 | Added consistent operator and role boundaries near homepage, contact, form, About, footer, and privacy conversion points. Removed ambiguous acquisition/team implications while retaining public SMKH branding. |
| F-09 | Added internal future-partner governance controls. No partner roster, login, routing, assignment, export, compensation, or delivery capability was enabled. |
| F-10 | Public and voice copy state that Workside/SMKH are not a brokerage, buyer, representative, negotiator, or adviser. A future legal role/compensation decision remains required before referral activity. |
| F-11 | Added neutral, nondiscriminatory future lead-handling and partner-review requirements. No protected-characteristic collection, routing, scoring, or partner allocation was added. |
| F-12 | Removed all draft links from the public Insights hub. Unapproved article routes now return 404 through existing Next.js routing and remain excluded from the sitemap. Source content was retained. |
| F-13 | Kept all four articles unapproved and unavailable; no probate, tax, foreclosure, title, tenant, or other legal-sensitive expansion was published. |
| F-14 | Added accurate AI-assisted telephone treatment to the privacy policy without claiming unverified recording/transcription behavior. Live phone-channel data flow remains **NOT VERIFIED**. |
| F-15 | Added an internal read-only live-control recertification runbook using the existing PI postflight and production configuration gates. No PI query or configuration change was performed in this release. |

## Files changed

Application and configuration:

- `app/about/page.js`
- `app/contact/page.js`
- `app/insights/[slug]/page.js`
- `app/insights/page.js`
- `app/page.js`
- `app/privacy-policy/page.js`
- `components/Footer.js`
- `components/PropertyForm.js`
- `lib/consent-notices.js`
- `lib/form-config.js`
- `lib/leads.js`
- `lib/site.js`
- `lib/validation.js`
- `package.json`

Tests:

- `tests/consent.test.js`
- `tests/content.test.js`
- `tests/e2e/site.spec.js`
- `tests/e2e/turnstile.spec.js`
- `tests/validation.test.js`

Documentation:

- `docs/Merxus_AI_Prompt/Prompt.md`
- `docs/audits/2026-11-smkh-lead-generation-compliance/SMKH_LEAD_GENERATION_COMPLIANCE_AUDIT.md`
- `docs/compliance/data-retention-proposal.md`
- `docs/compliance/future-partner-governance.md`
- `docs/compliance/live-controls-recertification.md`
- `docs/compliance/privacy-request-handling.md`
- this release report

## Verification results

| Check | Result |
| --- | --- |
| `npm run lint` | PASS |
| `npm test` | PASS, 46/46 |
| `NEXT_PUBLIC_ROBOTS_INDEX=true npm run build` | PASS, Next.js 16.4.1, 25 generated routes |
| `npm audit --omit=dev --audit-level=high` | PASS, 0 vulnerabilities |
| Consent version/hash regression | PASS; both SHA-256 values recompute from exact notice text and altered/stale evidence is rejected |
| General Playwright desktop/mobile assertions | PASS; 96 reported cases completed, with a Windows dev-server teardown hang after completion noted as a harness issue |
| Focused 390px/1280px browser assertions | PASS; all 32 reported cases completed, with the same post-completion harness teardown issue |
| Turnstile isolated browser/API checks | PASS; all applicable success, invalid, and reused-token assertions passed against mocks; no production lead was created |
| Live responsive browser check | PASS at 390px and 1280px; exactly one homepage H1 and no horizontal overflow |
| Live analytics default state | PASS; consent defaulted to denied and no `page_view` appeared before acceptance in a clean browser context |
| Live form/Turnstile readiness | PASS; step two loaded the configured Turnstile client, no configuration/load error appeared, and submit remained disabled without a token |
| Git whitespace and credential-pattern review | PASS; no credential-like value detected in release files |

All browser form checks used synthetic browser-only or mocked values. The production lead endpoint was not submitted.

## Production verification

- Homepage, Contact, Privacy Policy, and Insights returned HTTP 200.
- Homepage retained exactly one H1: “Your Home. Your Options. Your Decision.”
- Homepage remained `index, follow` with a self-referencing `https://sellmykernhome.com` canonical.
- Workside operator and lead-generation-only boundaries were present in rendered production HTML.
- The form remained present; no production inquiry was submitted.
- `/admin` redirected an unauthenticated request to `/admin/login?next=%2Fadmin`; the login page remained noindex.
- `/privacy-policy` and `/thank-you` remained noindex.
- Each of the four unapproved `/insights/[slug]` routes returned HTTP 404, and `/insights` contained no links to them.
- `robots.txt` continued to allow approved public crawling, block `/api/`, and reference the canonical sitemap.
- `sitemap.xml` returned HTTP 200 with exactly 14 canonical public URLs and zero draft article URLs.
- The production Netlify build reached `ready` from the exact implementation commit.

## Merxus status

The repository prompt is corrected and ready for controlled platform review. **LIVE MERXUS CONFIGURATION NOT VERIFIED.** This release did not access or change the live agent, first utterance, recording/transcription settings, stored artifacts, recipients, retention, calls, SMS, or notification behavior. The prepared English/Spanish prompt text is not a claim that either language is enabled live.

## SEO preservation

- Existing homepage title, description, canonical, slogan/H1, local Bakersfield/Kern County relevance, commercial landing-page headings, GA4 event names, and telephone integration were preserved.
- Production indexing remained enabled for approved public pages.
- The intended sitemap count remained 14.
- Draft content is now less visible: no hub links, no sitemap entries, and HTTP 404 for unapproved slugs.
- Privacy Policy, Terms, Thank You, Admin, and API behavior remain outside the public sitemap under the existing indexability policy.

## Remaining legal and operational decisions

1. Verify the live Merxus prompt, initial disclosure, recording/transcription, artifacts, recipients, retention, and deletion behavior; obtain California review before treating the phone channel as certified.
2. Decide CCPA/CPRA applicability and approve request deadlines, appeal/non-discrimination language where applicable, deletion exceptions, and a dedicated operational request channel if needed.
3. Approve record-specific retention periods. The published policy currently states truthful criteria only.
4. Approve each future external recipient, role, permissible activity, contract, consent disclosure, data minimum, revocation process, fair-housing safeguards, audit trail, and any compensation before sharing.
5. Approve any future manual, SMS, automated, prerecorded, or artificial-voice marketing consent and suppression workflow by caller, purpose, channel, and technology.
6. Complete the prepared read-only PI/Netlify control recertification with secure production credentials; this release did not access the PI database or print environment values.
7. Complete factual/legal review before making any of the four draft articles public or indexable.

## Rollback

No database migration, schema change, consent rewrite, environment change, DNS change, or Merxus live change was made.

For an urgent application rollback, publish the preceding known-good Netlify deploy `6af215cd8ef4753644c09294` (commit `eeb40b5d1ed49e6dedd9bc5d6dafe4b954681412`) or create a reviewed non-destructive `git revert` of implementation commit `1f681fe2f092bad0b1d114d0b719f12a883cb1b5`. Do not delete or rewrite consent or seller records. Preserve the new consent evidence already stored, and prefer a forward fix if the issue concerns notice accuracy.

## Release integrity confirmations

- No external seller lead was shared, exported, routed, assigned, emailed, texted, or disclosed.
- No production seller lead was created, modified, or deleted.
- No marketing automation, SMS, outbound call, recording, transcription, partner recipient, referral compensation, or new notification recipient was enabled.
- No email, SMS, telephone call, or seller notification was sent.
- No PI, CutPro, GNZ, DNS, Supabase schema, RLS, grant, Auth membership, or production environment setting was changed.
