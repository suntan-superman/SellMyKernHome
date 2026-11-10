# SMKH Data Retention Criteria — Owner and Legal Approval Draft

**Status:** Internal proposal; no fixed period is approved by this document.

Workside should approve a record-specific schedule after legal and operational review. Until then, retention decisions must use documented necessity and must not claim a fixed public deadline.

| Record category | Current purpose | Proposed retention trigger | Deletion/de-identification consideration | Approval needed |
|---|---|---|---|---|
| Seller inquiry | Respond, follow up, document requested contact | Inquiry is inactive and no operational/legal need remains | Delete or de-identify contact/property fields; preserve only required suppression/audit evidence | Owner + legal |
| Consent evidence | Prove notice/version/choice/source | Related processing and any applicable claim period have ended | Preserve immutable version/hash and minimum evidence; avoid excess PII | Legal |
| Lead audit events | Security, authorization, change history | No security, dispute, or legal need remains | De-identify actor/lead linkage where appropriate without corrupting required audit integrity | Owner + legal |
| Notification log | Delivery and incident troubleshooting | Delivery issue and related audit need are closed | Delete provider identifiers/error details when no longer needed | Owner |
| Rate-limit record | Abuse prevention | Rate-limit window and security investigation need have ended | Delete hashed identifiers | Security owner |
| Admin membership/session | Authorization and access evidence | Access is revoked and audit needs are complete | Revoke immediately; retain only required historical evidence | Security owner |
| Analytics consent/local cookies | Honor user analytics choice | User withdraws or configured consent storage is no longer needed | Clear analytics cookies as implemented; retain no seller PII in GA4 | Owner |
| Merxus call metadata/audio/transcript/summary | NOT VERIFIED | No period can be proposed until live configuration and purpose are verified | Disable unnecessary recording; minimize/delete artifacts under approved policy | Owner + legal |
| Do-not-contact suppression | Honor withdrawal | Need to prevent unwanted contact remains | Retain minimum channel identifier and request evidence; do not use for marketing | Legal |

Before approving numeric periods, confirm backup behavior, processor deletion capabilities, litigation/security holds, statutory obligations, and whether the CCPA or another privacy law applies.
