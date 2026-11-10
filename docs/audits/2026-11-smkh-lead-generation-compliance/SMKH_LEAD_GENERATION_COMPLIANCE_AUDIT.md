# SellMyKernHome Lead-Generation Compliance Audit

**Audit date:** November 9, 2026

**Repository:** `SellMyKernHome`

**Audited branch and commit:** `main` at `eeb40b5d1ed49e6dedd9bc5d6dafe4b954681412`

**Production origin:** `https://sellmykernhome.com`

**Audit mode:** Read-only except for this report
**Legal status:** Technical and content compliance assessment; not legal advice

## 1. Executive summary

SellMyKernHome (SMKH) has a strong technical baseline for operating as a seller-inquiry website. The active website generally avoids prohibited buyer, brokerage, agency, pricing, fee, and closing claims. Workside Software is identified in the About page, Terms, and footer as the technology owner/maintainer. The seller form uses separate mandatory privacy acknowledgement and optional marketing consent, performs client- and server-side validation, requires server-verified Turnstile, rate-limits submissions, and writes to independent `smkh_*` tables. Admin access is authenticated and membership-gated, database Row Level Security (RLS) is defined, notifications are configured to remain disabled in the certified production build, and analytics is consent-gated and PII-minimized.

The current system is **conditionally suitable for its present, first-party inquiry-collection use**, but it is **not ready for external partner lead sharing or publication of additional legal-sensitive articles**. Four high-severity gaps require attention:

1. The repository's Merxus prompt calls SMKH a “property acquisition service,” which conflicts with the confirmed lead-generation-only model.
2. The website neither discloses nor records a specific permission to refer/share an inquiry with independent professionals or property buyers.
3. The live Merxus prompt, AI disclosure, recording/transcription behavior, data destinations, retention, and follow-up permissions cannot be verified from this repository.
4. The privacy policy does not provide a complete rights/request mechanism or definite retention framework; whether the CCPA applies to Workside cannot be determined from repository evidence.

No evidence was found of automatic external lead sharing, active SMS delivery, partner webhooks, referral compensation, GNZ routing, or public representations that Adam Teagarden, Gary, Brandon, GNZ, or Miramar Realty owns or operates SMKH. No real seller record was inspected and no inquiry was submitted.

### Finding totals

| Severity | Count |
|---|---:|
| Critical | 0 |
| High | 4 |
| Medium | 9 |
| Low | 2 |
| **Total** | **15** |

## 2. Status definitions

| Status | Meaning in this report |
|---|---|
| **VERIFIED** | Directly supported by repository source, generated application behavior, or a read-only production observation made during this audit. |
| **NOT VERIFIED** | Evidence is outside the repository or requires access not used in this audit. No favorable assumption is made. |
| **NOT APPLICABLE** | The reviewed feature or claim is not present in the current implementation. This does not authorize adding it later. |
| **REQUIRES LEGAL REVIEW** | Counsel must determine applicability, wording, or operational requirements. The report does not make the legal determination. |

## 3. Confirmed business model and operating boundaries

The following boundaries were supplied by the owner and treated as non-negotiable audit criteria:

- Workside Software owns and operates SellMyKernHome.com.
- SMKH is strictly a marketing and seller lead-generation/inquiry service.
- Workside and SMKH are not a real estate brokerage, property buyer, seller or buyer representative, negotiator, appraiser, or legal, tax, real-estate, or financial adviser.
- Independent licensed professionals and/or property buyers may handle referred inquiries only after an approved disclosure, consent, recipient-governance, and operating model exists.
- No referral-compensation structure is approved.
- Adam, Gary, Brandon, GNZ, and Miramar Realty must not be represented as SMKH owners or operators.
- The public-facing brand remains SellMyKernHome.com.

### Current alignment

**VERIFIED:** The About page, Terms, FAQ, footer, comparison pages, and form fine print materially support these boundaries. They say the site is an inquiry starting point, disclaim brokerage/buyer/contracting-party status, avoid outcome promises, and identify Workside's technology ownership.

**Gap:** The exact phrase “lead-generation service” is not consistently visible at each conversion point. Phrases such as “our team,” “we review,” “property-opportunity service,” and “Why work with us” can be read more broadly than intended when separated from the detailed disclaimers.

## 4. Audit scope and method

### Reviewed

- Public application pages, components, metadata, sitemap, robots rules, structured data, and content records.
- Seller intake form, validation, API route, Turnstile, rate limiting, idempotency, lead persistence, notifications, and analytics.
- Admin authentication, session handling, membership authorization, lead mutation RPC, RLS/grant migration, audit event model, and verification SQL.
- The untracked Merxus prompt at `docs/Merxus_AI_Prompt/Prompt.md` without changing it.
- Read-only production responses, metadata, redirects, mobile form presentation, consent state, and indexability.
- Current official government sources relevant to privacy, automated communications, recording, real-estate advertising, fair housing, probate, property tax, and inherited-property tax basis.

### Not performed

- No form submission, real or synthetic production lead, email, SMS, call, partner transfer, or notification.
- No Merxus test call or access to Merxus live configuration.
- No production database query, seller-record inspection, environment change, deployment, DNS change, commit, push, migration, or infrastructure action.
- No determination of Workside revenue, processing volume, data-sale/share revenue, corporate relationships, or other facts needed to decide CCPA applicability.
- No legal conclusion about licensure, referral compensation, TCPA coverage for a specific future communication, or CIPA compliance for a particular call flow.

## 5. Evidence inventory

### Business identity and public claims

| Evidence | What it establishes | Status |
|---|---|---|
| `app/page.js:28` | Homepage H1, local service area, primary inquiry CTA, phone alternative, AI-assisted-answering label, and “No obligation to sell.” | VERIFIED |
| `app/about/page.js:8` | Workside owns/maintains technology; SMKH does not represent itself as a brokerage, guaranteed buyer, or contracting party. | VERIFIED |
| `app/terms/page.js:5` | No agency, brokerage, fiduciary, purchase, representation, or other contract is created by submission; no outcome promise. | VERIFIED |
| `app/faq/page.js:8` | Website is an inquiry channel and does not promise that SMKH or anyone else will buy. | VERIFIED |
| `components/Footer.js:9,14` | Workside technology ownership/maintenance is displayed site-wide. | VERIFIED |
| `components/SellerLandingPage.js:11` | Comparison content disclaims cash-buyer, brokerage, attorney, tax-adviser, and contracting-party status. | VERIFIED |
| Search across active `app/`, `components/`, `content/`, and `lib/` | No Adam, Gary, Brandon, GNZ, or Miramar ownership/operation branding; no “fair offer,” guaranteed offer/closing, “we buy,” best-price, or no-fee promise. | VERIFIED |

### Lead capture and processing

| Evidence | What it establishes | Status |
|---|---|---|
| `components/PropertyForm.js:14-135` | Required/optional fields, step validation, privacy acknowledgement, optional marketing checkbox, Turnstile state, and submission body. | VERIFIED |
| `lib/validation.js:1-65` | Server-side cleaning, length/format checks, allowlists, and required consent acknowledgement/version. | VERIFIED |
| `app/api/leads/route.js` | Same-origin check, request-size limit, JSON validation, honeypot, rate limiting, Turnstile verification, and lead creation order. | VERIFIED |
| `lib/rateLimit.js` | Hashed-IP database rate limiting with fallback and server-side Turnstile verification. | VERIFIED |
| `lib/leads.js:11` | Independent lead record, source attribution, consent object, and server timestamp. | VERIFIED |
| `lib/notifications.js` | Notification code path and PII-minimized email content. | VERIFIED |
| `scripts/verify-production-config.mjs:40` | Certified production build fails unless notifications remain disabled. | VERIFIED in code/build gate; live Netlify value was not printed or changed |

### Data authorization and audit

| Evidence | What it establishes | Status |
|---|---|---|
| `supabase/migrations/20261101_smkh_property_intelligence.sql:62-285` | Independent tables, membership model, RLS, restricted grants, secured functions, audit trigger, and rate-limit RPC. | VERIFIED in migration source |
| `supabase/verification/20261101_smkh_pi_postflight.sql` | Expected owner membership, RLS, grants, and object checks. | VERIFIED as verification artifact; not rerun in this audit |
| `lib/admin-session.js` | Secure, HttpOnly, SameSite session; Supabase user verification and active membership check. | VERIFIED |
| `lib/admin-data.js` and `lib/admin-shared.js` | Authorized list/detail access, status model, notes/follow-up, and role-limited mutation. | VERIFIED |
| `proxy.js` | Admin/API access control, no-store, and noindex behavior. | VERIFIED |

### Analytics and SEO

| Evidence | What it establishes | Status |
|---|---|---|
| `components/Analytics.js` | Consent defaults denied; tag loads after grant; explicit page views; Admin exclusion; withdrawal; PII-minimized URLs. | VERIFIED |
| `lib/analytics.js:1` | Event and parameter allowlists, including `phone_click` and `generate_lead`. | VERIFIED |
| `app/sitemap.js`, `app/robots.js`, `lib/site.js`, route metadata | Canonicals, sitemap inclusion rules, public phone, indexability controls, and site origin. | VERIFIED |
| Read-only production observations | Canonical homepage 200/indexable; 14 sitemap URLs; redirects converge to HTTPS apex; Admin/API protected/noindex; draft inherited article noindex. | VERIFIED at audit time |

### Merxus

| Evidence | What it establishes | Status |
|---|---|---|
| `lib/site.js` | Public number `(661) 518-2801`, E.164 `+16615182801`, and “24/7 AI-assisted answering.” | VERIFIED |
| Header, hero, contact, footer, and seller CTAs | Centralized `tel:+16615182801` links and consent-aware `phone_click` tracking. | VERIFIED |
| `docs/Merxus_AI_Prompt/Prompt.md` | A repository prompt draft with an AI identity, scope controls, intake questions, and notification instructions. | VERIFIED as a file only |
| Live Merxus agent/configuration, recording, transcription, storage, recipients, and disclosure | Repository has no API/configuration evidence tying the prompt to the live number. | NOT VERIFIED |

## 6. Findings

| ID | Severity | Legal/review reference | Finding and evidence | Impact | Recommended action | Confidence |
|---|---|---|---|---|---|---|
| F-01 | **High** | Truthful role disclosure; California DRE licensure boundary | `docs/Merxus_AI_Prompt/Prompt.md:5` describes SMKH as a “property acquisition service.” Other prompt language says “our team” may determine whether a purchase offer is appropriate. This conflicts with the owner-confirmed lead-generation-only model and the public site's buyer/contracting-party disclaimers. | A caller could reasonably understand SMKH/Workside to be the acquirer or offer-maker. It also creates inconsistency between channels. | Before any prompt is approved or reused, replace acquisition/offer-maker language with a precise seller-inquiry/lead-generation role, name Workside as operator where appropriate, and state that any independent buyer/professional must identify itself separately. | High |
| F-02 | **High** | Privacy notice; CCPA if applicable; TCPA/recipient consent review | The form/privacy notice does not disclose referral to independent professionals or buyers and captures no sharing/referral choice. No recipient categories, purpose, selection criteria, or partner identity are recorded. | Current consent does not establish informed authorization for future third-party referral. Sharing could contradict the present “authorized SMKH administrators and providers” disclosure. | Keep external sharing disabled. Counsel should approve a referral notice and granular consent/data-minimization model before any partner receives a lead. Store the exact disclosure version, timestamp, selected recipient/category, purpose, and revocation state. | High |
| F-03 | **High** | California Invasion of Privacy Act (CIPA), Penal Code § 632; privacy/retention | The prompt proposes recording/transcription language only conditionally and contains no approved, exact disclosure. The live prompt, upfront AI disclosure, recording/transcription, caller consent, transcript/summary retention, and notification destinations are outside this repository. | If calls are recorded or transcribed without an appropriate disclosure/consent flow, exposure could be significant. Privacy statements may not match actual phone-channel processing. | Do not rely on the repository prompt as proof of live compliance. Obtain a read-only Merxus configuration export and data-flow/retention evidence; have California counsel approve the first utterance and recording/transcription consent design before enabling/continuing recording. | High |
| F-04 | **High** | CCPA/CPRA applicability and notices; Cal. Civ. Code § 1798.100 et seq.; 11 CCR § 7000 et seq. | `app/privacy-policy/page.js` lists categories/purposes/providers but gives only vague retention (“reasonably needed”), directs privacy questions through the seller form, and does not explain access, correction, deletion, opt-out, non-discrimination, verification, appeal/response channels, or specific retention criteria. CCPA applicability facts are unavailable. | If Workside is a covered business—or voluntarily promises comparable rights—the present policy/process may be incomplete. Even if not covered, the absence of a usable request process increases trust and operational risk. | Counsel/business owner must document CCPA threshold facts annually. Adopt a direct privacy-request channel, records/identity-verification procedure, retention schedule, deletion exceptions, and policy language appropriate to the applicability decision. | High on text; applicability not verified |
| F-05 | **Medium** | Evidence of notice/consent | `components/PropertyForm.js:92` submits `consentVersion: "2026-10-14-draft"`, while the privacy policy is dated November 1, 2026. The record stores a version and timestamp but not the exact notice text or immutable hash. | A future audit may not reliably reconstruct what the seller saw and accepted. A production consent artifact labeled “draft” undermines evidentiary quality. | Replace with an approved semantic/versioned identifier and preserve immutable copies or hashes of each notice/consent text. Migration of old records should preserve the original value, not rewrite history. | High |
| F-06 | **Medium** | TCPA and FCC rules for autodialed/artificial/prerecorded marketing; revocation | The optional marketing checkbox is separate and unbundled, which is good, but it says only “marketing calls or texts.” It does not identify the seller/caller, disclose automated/artificial/prerecorded technologies, specify scope/frequency, or explain reasonable revocation methods. No active SMS feature was found. | The checkbox should not be treated as blanket authorization for every manual, automated, AI-voice, prerecorded, or partner communication. Requirements vary by technology and purpose. | Keep marketing automation/SMS disabled until counsel maps each planned communication type. Use channel-, purpose-, technology-, and caller-specific language and implement durable revocation/do-not-contact handling. Do not assume one consent covers partners. | High |
| F-07 | **Medium** | Accurate entity/operator identity; structured-data accuracy | Organization JSON-LD identifies `Sell My Kern Home` as the organization but does not identify Workside Software as the legal owner/operator. Visible pages do identify Workside as technology owner/maintainer. | Machines and users may infer SMKH is a standalone operating entity rather than a Workside-owned brand/service. | Without changing public branding, have counsel/SEO review whether Organization schema should identify Workside as the operator/legal entity and SMKH as brand/service. Preserve the public SMKH name and avoid creating a false licensed entity. | High |
| F-08 | **Medium** | Truthful, non-misleading role disclosure | Some public conversion language uses “our team,” “we review,” “Why work with us,” and “property-opportunity service.” Strong limitations exist elsewhere, but “lead-generation service” and possible independent referral are not consistently stated near every intake point. | Context-dependent language could imply SMKH itself evaluates, advises, buys, or manages a transaction. | Add a short, consistent role disclosure at or near form/phone conversion points after legal approval: Workside operates SMKH as a seller-inquiry/lead-generation service; SMKH is not a broker or buyer; any independent recipient identifies its own role. | Medium-high |
| F-09 | **Medium** | Referral-fee/licensure/privacy governance | No referral-compensation structure is approved, and no external assignment or sharing capability was found. The admin `assigned_to` field points only to internal SMKH memberships. There is no approved partner roster, due-diligence standard, data-processing agreement, lead acceptance rule, or compensation ledger. | Adding a recipient or payment informally could create privacy, licensing, advertising, supervision, and accounting risk. | Treat partner sharing and compensation as blocked features. Obtain legal approval for permissible activities/compensation, recipient contracts, disclosures, consent, access controls, audit logs, deletion, incident handling, and complaint ownership before implementation. | High |
| F-10 | **Medium** | Cal. Bus. & Prof. Code §§ 10130 et seq., 10137, 10140.6; 10 CCR § 2773 | The site says it is not a brokerage and source review found no licensed acts. However, no legal memorandum defines the exact boundary between permissible marketing/referral intake and acts requiring a license, including qualification, property-specific advice, negotiation, matching, follow-up, and compensation. First-point-of-contact rules generally target licensees acting in licensed capacity; applicability to a future referred-licensee flow requires counsel. | Operators or AI could drift into licensed activity, or future licensed partners could trigger advertising disclosures not present today. | California real-estate counsel should approve a role matrix for Workside, Merxus, admins, buyers, and licensees; prohibited scripts/actions; escalation rules; compensation; and any first-point-of-contact disclosures. | Medium-high |
| F-11 | **Medium** | Federal/state fair housing and California Unruh/FEHA review | No discriminatory language was found, but there is no explicit equal-opportunity/fair-housing policy, partner nondiscrimination requirement, or monitored referral-allocation procedure. California CRD states housing-related services and advertising are covered broadly. | Future lead qualification, prioritization, routing, or partner selection could create disparate-treatment or advertising risk even if the present site copy is neutral. | Counsel should determine required public language and approve neutral lead-handling criteria, partner terms, staff/AI rules, complaint escalation, and periodic outcome review before referrals begin. | Medium |
| F-12 | **Medium** | Publication control; consumer clarity; SEO governance | All four article records are correctly `approvedForIndexing:false` and excluded from the sitemap, but `/insights` is indexable and links users to those publicly accessible noindex drafts. | `noindex` limits search indexing; it is not access control or publication approval. Users can read drafts, and search engines may still crawl links. | Before treating the articles as private/unpublished, remove draft links from the public hub or add actual access control. Before indexing any article, complete factual/legal approval and preserve the current noindex state until approval. | High |
| F-13 | **Medium** | Legal-sensitive educational content | Current inherited/as-is content is cautious and avoids most detailed legal claims. It does not substantively explain Letters Testamentary/Administration, IAEA authority, TOD deeds, joint tenancy/title clearance, small-estate thresholds, Prop. 19 calculations, basis exceptions, NHD exceptions, court confirmation/overbids, or due-on-sale. | This is not a current misstatement, but publishing detailed guidance later without current citations and counsel could create misleading advice. | Keep the four drafts noindex. Require dated official sources and California counsel review before adding legal thresholds, procedures, tax outcomes, deadlines, or transaction-specific guidance. | High |
| F-14 | **Low** | Phone-channel privacy transparency | The privacy policy lists telephone number as a form field but does not specifically describe Merxus AI, call metadata, audio, transcript, summary, recording purpose, retention, or downstream recipients. | The privacy policy could be incomplete if any of those phone-channel data types are actually processed. | After the live Merxus data flow is verified, update the policy and call disclosure to match actual categories, purposes, recipients, retention, and choices—no broader than reality. | Medium; live behavior not verified |
| F-15 | **Low** | Operational verification | Source migrations and prior verification artifacts show strong RLS/grants, and the production build gate requires notifications disabled. This audit did not query the live PI database or Netlify environment, so current effective grants, policies, membership count, notification flag, and absence of configuration drift were not independently re-certified. | A source-level control can diverge from live state. No evidence of drift was found, but the live state remains outside this audit's proof set. | Add a recurring read-only compliance check that reports only non-sensitive booleans/counts and privilege results. Do not include lead content or secret values. | Medium |

## 7. Full data-flow map

### 7.1 Website inquiry — current verified path

```text
Seller browser
  │
  ├─ Required: street address, city, ZIP, name,
  │            selected contact method + email or phone,
  │            privacy acknowledgement
  ├─ Optional: property type, condition, occupancy, timing,
  │            comments, marketing consent
  ├─ Metadata: started time, submission token, landing page,
  │            referrer/campaign/source attribution, Turnstile token
  │
  ▼
POST /api/leads
  ├─ same-origin enforcement
  ├─ 32 KB request limit
  ├─ client + independent server validation/sanitization
  ├─ honeypot check
  ├─ hashed-IP rate limit
  ├─ server-side Cloudflare Turnstile verification
  └─ rejection stops before persistence/notification
  │
  ▼
Trusted server Supabase client (server-only secret)
  │
  ├─ INSERT public.smkh_leads
  │    ├─ source=seller_web / source_site=sellmykernhome.com
  │    ├─ contact/property/message/attribution
  │    └─ consent object + server timestamp
  │
  ├─ database audit trigger → public.smkh_lead_events
  │
  └─ notification function
       ├─ production gate requires SMKH_NOTIFICATIONS_ENABLED=false
       ├─ disabled state writes/logs disabled outcome as designed
       └─ enabled implementation would send only reference + secure admin URL,
          not seller/property PII, through Resend

Authorized administrator
  │
  ├─ Supabase Auth password session
  ├─ active public.smkh_admin_memberships check
  ├─ secure HttpOnly/SameSite session cookie
  ├─ RLS-limited read access
  └─ owner/admin/operator mutation through trusted RPC
       └─ audit event stores verified human actor separately from system actions
```

### 7.2 External sharing — current state

```text
smkh_leads ──X──> partner / buyer / brokerage / GNZ / Miramar / other recipient
```

- **VERIFIED:** No partner webhook, export, email payload, SMS integration, public table access, external assignee model, or automatic sharing path was found.
- **VERIFIED:** `assigned_to` is an internal FK to `smkh_admin_memberships`, not a partner assignment.
- **NOT APPLICABLE today:** Referral compensation and external lead delivery.
- **BLOCKED pending approval:** Any future sharing requires disclosure, appropriate consent, recipient identity/governance, legal review, data minimization, auditability, and compensation approval.

### 7.3 Telephone/Merxus — incomplete evidence

```text
Caller → (661) 518-2801 → Merxus AI platform (outside repository)
                              ├─ live prompt/version: NOT VERIFIED
                              ├─ AI disclosure: NOT VERIFIED live
                              ├─ recording/transcription: NOT VERIFIED
                              ├─ summary/notification recipients: NOT VERIFIED
                              ├─ retention/deletion: NOT VERIFIED
                              └─ SMKH database integration: no code path found
```

The repository prompt asks for property/contact/motivation/condition/occupancy/timeline and an optional expected price, and describes notification summaries. That proves only draft intent, not live behavior.

## 8. Consent and privacy disclosure inventory

| Item | Current implementation | Assessment |
|---|---|---|
| Notice placement | Mandatory acknowledgement in Step 1 beside a Privacy Policy link; visible in mobile read-only testing. | VERIFIED safeguard |
| Submission consent | “SMKH will use this information to review my inquiry and contact me about this property.” | Suitable for first-party inquiry response; not partner sharing |
| Marketing consent | Separate optional checkbox; unchecked by default; not required to submit. | Good separation; not sufficient as blanket automated/partner consent |
| Required data | Property address/city/ZIP, name, selected contact channel, privacy acknowledgement. | VERIFIED |
| Optional data | Other contact channel, property type/condition/occupancy/timing/comments, marketing consent. | VERIFIED |
| Hidden/technical data | Honeypot, timestamps, UUID submission token, attribution, hashed-IP rate-limit key, Turnstile token. | VERIFIED; raw IP is not stored by application rate-limit code |
| Consent record | Privacy acknowledgement, version, server timestamp; marketing boolean/timestamp; source/attribution. | Partial safeguard; exact approved text/hash missing |
| Sharing consent | None. | VERIFIED absent; must remain disabled |
| Call/SMS distinction | Preferred contact choice and optional marketing checkbox exist; manual/informational/automated/artificial/prerecorded scopes are not separately recorded. | REQUIRES LEGAL REVIEW |
| Privacy categories/purposes | Contact, property, consent, attribution, abuse prevention, notifications, analytics described. | VERIFIED, generally aligned with web path |
| Service providers | Netlify, Supabase, Turnstile, Resend, and consented Google Analytics described. | VERIFIED for code architecture |
| Phone AI/recording/transcript | Not specifically described. | NOT VERIFIED / gap |
| Retention | “Reasonably needed” with broad purposes; no schedule/criteria by record type. | Gap |
| Rights/request process | Privacy questions through seller contact form only; no dedicated procedure. | Gap; applicability REQUIRES LEGAL REVIEW |
| CCPA applicability | Revenue/volume/sale-or-share facts unavailable. | NOT VERIFIED; counsel/business determination required |

## 9. Merxus AI review

### Verified safeguards in the repository prompt

- The prompt introduces “Sarah” as an AI-powered virtual receptionist and says never to pretend to be human.
- It prohibits legal, tax, real-estate, valuation, lending, and financing advice.
- It prohibits guaranteed offers, prices, appointments, approvals, closing dates, and transaction outcomes.
- It limits the interaction to intake and notification rather than warm transfers or appointment scheduling.
- It tells the agent not to assume marketing consent and to record consent preferences separately.

### Conflicts and gaps

- **Role conflict:** “homeowner assistance and property acquisition service” is incompatible with the confirmed lead-generation-only model.
- **Acquisition implication:** “our team” and purchase-offer language can imply SMKH/Workside is the buyer or offer-maker.
- **Live proof absent:** The repository does not show that this prompt/version is deployed to the public number.
- **AI disclosure not proven live:** A good draft greeting is not proof of the first words a caller hears.
- **Recording/transcription:** The prompt conditionally refers to an approved disclosure, but no approved text, consent capture, or configuration is present.
- **Referral permission:** No specific permission for sending a caller's information to an independent professional/buyer is defined.
- **Retention/recipients:** No authoritative list of stored call artifacts, retention periods, data locations, notification recipients, or deletion mechanism is present.
- **Privacy alignment:** The public privacy policy does not describe Merxus, audio, transcript, or call-summary processing.

### Merxus readiness

**NOT VERIFIED for compliance.** The telephone CTA and number are correctly represented as “24/7 AI-assisted answering,” but the live service needs an external evidence review before the phone channel can be certified.

## 10. Article-specific legal and factual review

All four insight articles are `approvedForIndexing:false`, emit `noindex`, and are excluded from the sitemap. They remain publicly reachable through the indexable `/insights` page.

| Topic requested by legal review | Current content status | Assessment before future publication |
|---|---|---|
| Probate / independent administration | Inherited content says process depends on ownership/estate and refers readers to California Courts/counsel. No detailed IAEA procedure. | Current wording is cautious. Detailed authority, notice, appraisal, confirmation, and sale-power claims require counsel and current official sources. |
| Letters Testamentary / Administration | Not substantively explained. | NOT APPLICABLE to current claims; REQUIRES LEGAL REVIEW if added. |
| Trustee authority / certification | Roles are said not to be interchangeable; no procedural claim. | Keep general unless counsel approves exact authority/document discussion. |
| Transfer-on-death deeds | Not discussed. | NOT APPLICABLE; legal review if added. |
| Joint tenancy / title clearance | Not discussed beyond advice to confirm title/authority. | NOT APPLICABLE; legal review if added. |
| Small-estate / real-property procedures | No threshold or procedure stated. | Correctly avoids a changing threshold. Use current California Courts/DE-300 evidence and counsel if added. |
| Proposition 19 | No tax-benefit or reassessment claim. | NOT APPLICABLE; any future summary needs BOE sources, dates, eligibility caveats, and tax/legal review. |
| Inherited-property basis | Tells readers to consult a tax professional; no “automatic step-up” promise. | Current wording is safer. Any future explanation must account for exceptions and use current IRS sources. |
| As-is disclosures / statutory exceptions | Says as-is language does not eliminate disclosure analysis and links to DRE material. | Sound high-level framing; do not enumerate exemptions without counsel/current source review. |
| Natural Hazard Disclosure | Not specifically discussed. | NOT APPLICABLE; review property/transaction exemptions and current statutory forms before adding. |
| Court confirmation / overbids / appraisal | Not discussed. | NOT APPLICABLE; highly legal-sensitive and should remain unpublished without counsel. |
| Mortgages / due-on-sale | Records/liens are mentioned only generally; no due-on-sale rule stated. | NOT APPLICABLE; counsel/lender-specific review if added. |
| Tenant rights | Public rental page tells users to verify lease/notices/rights and cites DRE; no procedural legal advice. | Preserve general framing; separate legal review before expanding. |
| Fair housing / equal opportunity | No discriminatory content found; no policy/statement/governance found. | Counsel should define operational and public requirements before partner routing. |
| DRE first-point-of-contact | SMKH says it is not a brokerage and no licensee is publicly represented. | Applicability to SMKH's current model and any future licensed-recipient advertising requires California counsel. Do not add a license number or broker identity unless factually applicable. |

### Official source checks

- [California Courts — Guide to property after someone dies](https://selfhelp.courts.ca.gov/probate) confirms that the process depends on ownership and circumstances and that a court may appoint a personal representative.
- [California Courts — When formal probate may not be needed](https://selfhelp.courts.ca.gov/probate/simple-transfer) directs users to current limits rather than supporting a timeless threshold.
- [California BOE — Proposition 19](https://www.boe.ca.gov/prop19/) documents operative dates, exclusions, claims, and changing amounts while warning that the summary is not legal advice.
- [IRS Publication 559](https://www.irs.gov/publications/p559) states the general inherited-basis rules and important exceptions.
- [California DRE — Disclosures in Real Property Transactions](https://www.dre.ca.gov/files/pdf/re6.pdf) is an appropriate official starting source for disclosure content, not a substitute for transaction-specific advice.

## 11. SEO preservation baseline

Snapshot at audit time:

| Control | Baseline |
|---|---|
| Homepage H1 | Exactly one: “Your Home. Your Options. Your Decision.” |
| Supporting local copy | Bakersfield and Kern County are prominent in hero copy. |
| Title | `Sell Your House in Bakersfield & Kern County \| Sell My Kern Home` |
| Canonical | `https://sellmykernhome.com/` self-reference on homepage; route-specific HTTPS apex canonicals elsewhere. |
| Meta description | Present and aligned with seller inquiry/option exploration. |
| Homepage robots | `index, follow` observed. |
| Redirects | HTTP apex → HTTPS apex; HTTP www → HTTPS www → HTTPS apex; HTTPS www → HTTPS apex. Permanent redirects, no loop observed. |
| `robots.txt` | Allows public crawling, disallows `/api/`, references sitemap. |
| Sitemap | 14 intended public HTTPS apex URLs; all returned 200 at the observed snapshot. |
| Admin/API | Protected/noindex; Admin redirected to login when unauthenticated; API GET rejected. |
| Draft articles | `noindex, follow`; excluded from sitemap. |
| Structured data | Organization + WebSite on homepage; Article + Breadcrumb on article routes. Operator-identity issue noted in F-07. |
| Seller landing H1s | Unique and locally targeted for Bakersfield/Kern County situations. |
| Internal links | Public selling-situation, comparison, contact, and guide links present; draft visibility issue noted in F-12. |
| GA4 consent | Default denied; tag not loaded before grant in observed test; explicit App Router page views; Admin excluded. |
| GA4 events | Allowlisted: `phone_click`, `email_click`, `primary_cta_click`, `seller_form_start`, `seller_form_validation_error`, `form_step`, `seller_form_submit_success`, `generate_lead`. |
| PII controls | Event parameters allowlisted; query string and seller fields not intentionally sent; `generate_lead` runs only after successful API response and not on an idempotent duplicate. |
| Mobile | Form notices/optional consent visible; no horizontal overflow observed at 390px; no submission made. |

Legally necessary disclosure changes should be made narrowly and tested so these canonicals, headings, internal links, event names, consent behavior, and indexing rules remain intact. Wholesale SEO rewrites are not indicated.

## 12. Minimal remediation plan

### P0 — Before publishing new articles or introducing partner sharing

1. **Freeze sharing and compensation:** Keep all external sharing, partner assignment, automated outreach, and referral payments disabled.
2. **Resolve the Merxus role conflict:** Approve a lead-generation-only prompt; verify the deployed version, first utterance, AI disclosure, recording/transcription settings, call data flow, recipients, and retention.
3. **Approve referral governance:** Counsel must define permissible Workside/Merxus/admin/partner acts, partner identity disclosure, compensation, fair-housing rules, recipient due diligence, contracts, and complaint/incident ownership.
4. **Design referral consent:** Add no sharing until a clear notice and granular, recorded permission appropriate to recipient/purpose/channel is approved. Do not silently repurpose existing leads.
5. **Resolve privacy applicability/process:** Record CCPA threshold facts; approve notice-at-collection, rights/request channel, retention/deletion schedule, service-provider/contractor treatment, and phone-channel disclosure.
6. **Control draft publication:** Keep all four articles noindex; remove public draft links or explicitly approve them as publicly readable drafts. Counsel must approve legal-sensitive content before indexing.

### P1 — Existing public-site disclosure and consent improvements

1. Replace the draft consent-version identifier with an approved immutable version and archive exact text/hash.
2. Add concise, consistent role language near form/phone CTAs without weakening current SEO headings.
3. Align Organization schema with Workside ownership/operator facts while preserving SMKH as the public brand.
4. Add a direct privacy-request method and definite retention criteria/schedule.
5. If any automated/artificial/prerecorded marketing is planned, replace generic marketing consent with counsel-approved, technology/caller/purpose-specific consent plus revocation/do-not-contact controls.
6. Add a documented recurring, read-only check of live RLS/grants, owner membership, notification disablement, and configuration drift without exposing records or secrets.

### P2 — Optional editorial/SEO improvements

1. Add a plain-language “Who we are / who we are not” explainer linked from contact/FAQ, only after legal copy approval.
2. Add an editorial source/date/reviewer block to educational content and a periodic official-source review date.
3. Consider a neutral fair-housing/equal-opportunity statement after counsel determines wording and scope.
4. Improve source annotations without adding thresholds, promises, or transaction advice.

## 13. Exact questions for Adam and Miramar Realty's legal team

1. Under the confirmed model, which specific intake, qualification, routing, and follow-up acts may Workside, SMKH administrators, and Merxus perform without a California real-estate license?
2. Does any contemplated partner activity make the SMKH website or an advertisement a first point of contact for a licensee under Business and Professions Code § 10140.6 / 10 CCR § 2773? If so, whose name, broker identity, and license number must appear, where, and when?
3. May Workside receive any flat fee, per-lead fee, success fee, marketing fee, or other value from a broker, licensee, investor, or buyer? Which structures are prohibited or require licensure/disclosure?
4. What exact disclosure must appear before an inquiry can be referred to an independent licensed professional or property buyer?
5. Must the seller affirmatively select or separately consent to each named recipient, recipient category, communication purpose, and communication channel?
6. Can a pre-existing inquiry be referred under a newly adopted notice, or is new affirmative consent required?
7. What contracts and CCPA roles should apply to each recipient—service provider, contractor, third party, buyer, or other—and is any transfer a “sale” or “sharing” under applicable law?
8. Does Workside currently meet a CCPA coverage threshold, directly or through an affiliated/common-control business? Who will document the annual determination?
9. If CCPA does not apply, which California privacy rights/processes will Workside voluntarily offer, and how should the policy avoid overpromising?
10. What retention periods and deletion exceptions should apply to leads, consent evidence, audit events, rate-limit hashes, notification logs, calls, recordings, transcripts, summaries, and do-not-contact records?
11. What exact first-utterance wording is required for Merxus to disclose AI use and, if applicable, recording/transcription to California callers? What constitutes valid consent before processing continues?
12. Can call transcription occur without retaining audio? Does that alter the approved disclosure/consent or retention requirements?
13. Which manual, informational, automated, autodialed, artificial-voice, prerecorded, marketing, and partner follow-up communications are planned? What consent and revocation method applies to each?
14. Does the current optional marketing checkbox meet requirements for any planned communication? If not, provide exact approved language and seller/caller identification.
15. What fair-housing/equal-opportunity policy, routing criteria, monitoring, partner warranties, and public statement are required for a seller lead-generation service?
16. Is identifying Workside as “owner/operator” and SMKH as its public brand/service in Organization schema and notices accurate and sufficient?
17. Are the current public inherited/as-is/rental pages approved as general education? Which passages, if any, should change now?
18. Before any draft article is indexed, which topics require attorney or tax-professional authorship/review and what disclaimer/source format is required?
19. Should publicly reachable noindex drafts be removed from `/insights`, access-controlled, or may they remain visible while unindexed?
20. What complaint, withdrawal, correction, deletion, and “do not contact/share” workflow must admins follow, and what evidence must be retained?

## 14. Changes that must not be implemented without further approval

- Do not share, export, email, text, webhook, assign, or otherwise disclose a seller lead to Adam, Gary, Brandon, GNZ, Miramar, a broker, an investor, a buyer, or any other external party.
- Do not introduce referral compensation, marketing fees, success fees, revenue sharing, or any payment tied to a lead or transaction.
- Do not represent Workside or SMKH as a brokerage, agent, buyer, wholesaler, investor, contracting party, appraiser, adviser, or negotiator.
- Do not use “we buy,” “our offer,” “property acquisition service,” guaranteed/fair/best offer, guaranteed closing, no-fee, or similar unsupported language.
- Do not add a person's brokerage, license number, business identity, testimonial, transaction history, review, or affiliation without factual verification and approval.
- Do not enable automated/artificial/prerecorded calls, SMS marketing, or partner follow-up based on the current generic checkbox.
- Do not record or transcribe calls without a counsel-approved disclosure/consent flow and verified retention/deletion controls.
- Do not repurpose previously collected leads under a new sharing purpose without legal approval and appropriate consent.
- Do not publish/index the four draft articles or add probate, foreclosure, tenant-rights, tax, Prop. 19, title, court-confirmation, overbid, NHD, or due-on-sale guidance without specific review.
- Do not modify PI database schema/permissions, RLS, service-role access, production environment variables, analytics consent, Turnstile, notification enablement, DNS, or indexing as part of compliance remediation without a separate approved change plan.
- Do not add real seller data to tests, analytics, URLs, logs, notifications, screenshots, or reports.
- Do not infer that `noindex` makes content private.

## 15. Existing safeguards to preserve

- Strong public disclaimers against brokerage, buyer, agency, contract, advice, and outcome representations.
- Workside technology ownership stated in About, Terms, and footer.
- Mandatory privacy acknowledgement plus separate optional marketing consent.
- Client/server validation, sanitization, honeypot, same-origin enforcement, request-size limit, Turnstile, hashed-IP rate limiting, and idempotency.
- Server-only privileged Supabase access; no service secret in browser code.
- Independent `smkh_*` schema, RLS, least-privilege grants, membership-gated Admin access, secured RPC, and actor-attributed audit trail.
- Notification payload designed to exclude seller/property PII and production build gate requiring notifications disabled.
- Consent Mode default denied, explicit page views, Admin analytics exclusion, parameter allowlists, and post-success-only `generate_lead`.
- Centralized public telephone/E.164 value and PII-safe `phone_click` tracking.
- Canonical HTTPS apex, controlled sitemap, protected Admin/API routes, and draft article noindex state.
- Cautious public educational content with official-source links and professional-review caveats.

## 16. Production readiness recommendation

### Present first-party website intake

**CONDITIONALLY READY TO CONTINUE, subject to operational confirmation.** The current first-party web intake is technically controlled and publicly avoids the most serious role/claim problems. Preserve notifications disabled, keep access restricted to authorized SMKH personnel, do not share externally, and schedule P1 disclosure/consent evidence improvements. A read-only live privilege/configuration recertification should be completed through the existing secure production procedure.

### External partner sharing or referral compensation

**NOT READY.** No lead should be shared and no compensation should be introduced until F-02, F-04, F-06, F-09, F-10, and F-11 are resolved through legal and business approval, implemented with auditable consent/governance, and verified end to end.

### Merxus phone-channel certification

**NOT VERIFIED / NOT READY FOR COMPLIANCE CERTIFICATION.** The public AI-assisted label is helpful, but the live prompt, recording/transcription, permissions, recipients, and retention must be externally inspected. The repository prompt's acquisition-service language must not be treated as approved.

### New article publication

**NOT READY.** Keep all four drafts noindex and do not publish legal-sensitive expansion until the draft visibility decision, source review, and California legal review are complete.

## 17. Authoritative legal/reference sources

These sources informed issue spotting; counsel should confirm their application to the actual business and future communication/referral design.

- [California DOJ — California Consumer Privacy Act](https://oag.ca.gov/privacy/ccpa) — consumer rights, coverage overview, notices, and privacy-policy responsibilities.
- [California Privacy Protection Agency — CCPA statute effective January 1, 2026](https://cppa.ca.gov/regulations/pdf/ccpa_statute_eff_20260101.pdf) — current statute/regulation compilation and notice-at-collection requirements.
- [CPPA — 2025 rulemaking effective January 1, 2026](https://cppa.ca.gov/regulations/ccpa_updates) — finalized regulatory updates.
- [FCC DA 25-496](https://docs.fcc.gov/public/attachments/DA-25-496A1.pdf) — distinction between certain informational communications and telemarketing robocalls/robotexts requiring prior express written consent.
- [FCC 24-24](https://docs.fcc.gov/public/attachments/FCC-24-24A1_Rcd.pdf) — consent and revocation rules for covered robocalls/robotexts.
- [Judicial Council of California — 2026 Civil Jury Instructions, CACI 1809](https://courts.ca.gov/system/files/file/judicial_council_of_california_civil_jury_instructions_2026.pdf) — elements concerning recording confidential communications without all-party consent.
- [California DRE RE 559 — License Disclosure Requirements for Advertising](https://www.dre.ca.gov/files/pdf/forms/re559.pdf) — licensee first-point-of-contact advertising rules.
- [California DRE — Unlicensed Administrative Assistants](https://dre.ca.gov/Licensees/UnlicensedAssistants.html) — limits on unlicensed persons performing licensed acts and compensation concerns.
- [California Civil Rights Department — Housing discrimination](https://calcivilrights.ca.gov/housing/) — housing-related services, advertising, and protected characteristics.
- [California Courts — Probate guide](https://selfhelp.courts.ca.gov/probate) — ownership, authority, and probate-process overview.
- [California BOE — Proposition 19](https://www.boe.ca.gov/prop19/) — current official summary and filing information.
- [IRS Publication 559](https://www.irs.gov/publications/p559) — inherited-property basis and exceptions.

## 18. Audit integrity statement

This audit created only this Markdown report. It did not modify application code, content, environment variables, database records, production resources, DNS, Netlify, Supabase, PI, GNZ, CutPro, or Merxus. It did not deploy, commit, push, migrate, submit a lead, send an email or text, place a call, or share data. Existing untracked files, including `docs/Merxus_AI_Prompt/`, were preserved.
