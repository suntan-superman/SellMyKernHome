# Sell My Kern Home content approval register

Status date: October 14, 2026. This file holds internal review items so the visitor experience does not display development TODO notices.

## Required approvals before indexing or deployment of this phase

| Area | Decision/approval needed | Current implementation |
| --- | --- | --- |
| Business role | Gabriel must confirm GNZ's actual transaction role, legal contracting entity, and which roles may truthfully be described. | Pages state only that GNZ receives and reviews inquiries. They do not claim brokerage, direct purchase, assignment, double closing, buyer introduction, or a guaranteed offer. |
| Seller promises | Approve any future statements about cash, fees, commissions, repairs, closing speed, price, eligibility, or response time and retain evidence. | No such promise is published in the new copy. |
| Identity/contact | Confirm legal entity name, public email, telephone, mailing/business address, and any accessibility/privacy contact. | No office address or direct contact channel is invented. |
| Licensing | Confirm whether any license may or must be stated, including license holder/name/number and role. | No brokerage or licensing claim is made. |
| Privacy | California counsel should approve data-controller identity, retention, consumer-request method, provider disclosures, and final privacy wording. | Privacy page accurately summarizes the implemented data flow but remains `noindex`. |
| Website terms | California counsel should approve entity identity, governing law, dispute language, intellectual property, limitations, and final terms. | Terms remain conservative and `noindex`. |
| Call/text consent | Counsel should approve the optional marketing-consent sentence and operational-contact basis; confirm whether additional TCPA/California language is required. | Consent remains separate, optional, and stored separately; it is never required for inquiry submission. |
| Educational articles | Counsel or a qualified California real-estate reviewer should review legal/disclosure passages and linked sources. | All articles are data-marked `approvedForIndexing: false` and emit page-level `noindex`. |
| Seller landing pages | Gabriel and legal reviewer should approve role language, CTAs, and local content. | All five pages are data-marked `approvedForIndexing: false`. |
| Analytics consent | Confirm whether GA4 may load before consent and update the privacy/consent experience if required. | No Measurement ID is committed; GA4 remains inactive when the variable is empty. |

## Page-by-page editorial status

| Content | Status | Notes |
| --- | --- | --- |
| Homepage and existing informational pages | Ready for stakeholder review | Neutral language only; no buyer, brokerage, cash, speed, savings, or outcome claim. |
| Five seller landing pages | Draft complete; approval required for indexing | Differentiated broad, as-is, inherited, repairs, and rental intent. |
| What to Know Before Selling a House As-Is in Bakersfield | Draft complete; legal/editorial review required | Links to California DRE disclosure guidance. |
| Selling an Inherited Property in Kern County: Questions to Consider | Draft complete; legal/editorial review required | Links to California Courts self-help resources; no individualized probate/tax conclusion. |
| Understanding Your Options When a House Needs Major Repairs | Draft complete; legal/editorial review required | Uses conditional comparison language and DRE source. |
| Questions to Ask Before Signing a Property Purchase Agreement | Existing draft retained and hardened; legal review required | Remains `noindex` and excluded from sitemap. |
| Privacy Policy and Website Terms | Interim accurate copy; legal approval required | Both remain `noindex`, excluded from sitemap, and must not be treated as counsel-approved. |

## Approval mechanics

1. Review the rendered pages locally and record approval owner/date for each item above.
2. Revise any rejected wording without adding unsupported claims.
3. Set `approvedForIndexing: true` only for individually approved seller pages/articles.
4. Run the full test/build/security suite and review the generated sitemap with `NEXT_PUBLIC_ROBOTS_INDEX=true` in an isolated build.
5. Keep the production Netlify environment at `NEXT_PUBLIC_ROBOTS_INDEX=false` until separate launch authorization.

Approval of copy does not itself authorize deployment, indexing, Search Console submission, production tests, DNS changes, or database changes.
