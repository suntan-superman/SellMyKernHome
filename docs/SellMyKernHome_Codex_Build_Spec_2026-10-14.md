# SellMyKernHome.com — Codex Build Specification
Prepared for Workside Software LLC / GNZ Marketing Group LLC | October 14, 2026
Status: INTERNAL REVIEW BUILD — do not publish without approval.

## Mission
Build a standalone, original, high-quality Next.js website to generate homeowner seller inquiries in Bakersfield and Kern County. Keep GNZ Marketing Group as the parent organization and its investor acquisition campaign on gnzmarketingllc.com. Integrate seller leads with the existing GNZ Supabase/Admin system, without disrupting current functions.

## Reference and boundaries
Review https://bakersfieldcashoffer.com/ for its effective conversion architecture: immediate property-address CTA, concise three-step process, homeowner situations, local trust, FAQs, repeated calls to action, and transparent footer. Do not copy its content, source code, photographs, brand, layout, testimonials, claims, or disclosures. Create an original identity.

**Legal gate:** Gabe has not yet confirmed whether GNZ enters assignable purchase contracts as principal or acts as an intermediary. Do not claim “we buy houses,” “guaranteed cash offer,” “no commissions,” “close in 7 days,” “licensed brokerage,” or similar assertions. Do not advertise foreclosure rescue or legal advice. A California real-estate attorney must review the transaction model, seller-facing claims, contracts, and required disclosures before public launch. No boilerplate disclaimer substitutes for compliant operations.

## 1. Technical foundation
- Separate GitHub repo and Netlify site for SellMyKernHome.com; use Next.js, React, JavaScript only, and Tailwind if consistent with Workside conventions. No TypeScript.
- First inspect GNZ codebase, Supabase schema, RLS, Admin roles, notification provider, form handling, analytics, and deployment. Produce `docs/integration-audit.md` identifying what can safely be reused and what requires changes. Do not guess table names or credentials.
- Reuse GNZ Supabase and Admin where safe; never expose service-role keys in the browser. Put secrets in Netlify environment variables. Create `.env.example` with placeholders.
- Provide migration and rollback scripts, tests, README, and deployment runbook. Do not alter GNZ production database without explicit approval.
- Build staging/preview first. Do not change Cloudflare DNS, custom domain, or production deployment without authorization.

## 2. Visual identity
Distinct from GNZ corporate but clearly affiliated. Design direction: premium, welcoming, trustworthy local-property brand. Suggested tokens: forest `#145D49`, dark ink `#19332D`, sage `#DFEBE4`, warm ivory `#F7F5EF`, white `#FFFFFF`, body `#394740`, subtle brass `#C6A56C`. Adjust to WCAG AA contrast. Spacious layout, restrained motion, strong typography, real licensed Kern County home imagery, mobile-first design. No fake portraits, ratings, testimonials, transactions, or stock-watermarked photos. Design original wordmark and reusable components.

## 3. Pages and navigation
Header: Home | How It Works | Selling Situations | About | FAQ | Contact; primary CTA “Tell Us About Your Property”. Mobile sticky CTA only if accessible and unobtrusive.

Routes:
- `/` homepage
- `/how-it-works`
- `/selling-situations` hub
- `/selling-situations/inherited-property`
- `/selling-situations/house-needs-repairs`
- `/selling-situations/rental-property`
- `/selling-situations/vacant-property`
- `/selling-situations/relocating`
- `/about`, `/faq`, `/contact`, `/privacy-policy`, `/terms`, `/thank-you`

Do not automatically publish foreclosure/probate/legal-sensitive pages, unsupported city doorway pages, or investor listings. Keep investor campaign on GNZ.

## 4. Homepage copy and composition
Eyebrow: “BAKERSFIELD & KERN COUNTY”.
Hero: **“Thinking About Selling Your Kern County Home?”**
Subhead: “Tell us about your property and what you're hoping to accomplish. We'll review the details and contact you to discuss possible next steps—without pressure.”
Hero address-first CTA: **“Discuss My Property”**. Do not promise a cash offer until business model is confirmed.

Sections, in order:
1. Hero with property address field and real licensed local-home image.
2. Brief reassurance: private inquiry, clear next steps, no obligation to submit (verify actual data handling).
3. “Situations We Can Discuss”: inherited property, repairs, rental, vacant home, relocation; cards link to useful dedicated pages.
4. “How It Works”: Tell us about your property → We review your situation → Discuss possible next steps. No invented response or closing timeline.
5. “Why Work With Us”: local focus, respectful conversation, clear communication, property-specific options. No unsupported superlatives.
6. Real About section identifying the actual GNZ entity/operator once approved; no invented biography.
7. Useful FAQ, final CTA, and footer with accurate parent-brand connection and approved legal copy.

Repeat contextual CTAs without overwhelming visitors. Avoid fake urgency, countdown timers, fabricated savings, and misleading trust badges.

## 5. Seller inquiry funnel
Two-stage responsive form. Stage 1: property address/city/ZIP, name, preferred contact, validated email or phone, privacy acknowledgement. Stage 2 optional: property type, approximate condition, occupancy, desired timing, comments. Avoid collecting financial hardship, mortgage balance, or sensitive details unnecessarily. Manual address entry always works; optional autocomplete only if properly configured.

Server-side validation, spam honeypot, rate limiting, anti-abuse, duplicate-submit protection, accessible errors, success page, and notification delivery logs. Clearly state who receives the information. Separate optional marketing SMS/call consent; no prechecked boxes. Obtain legal review of TCPA/California consent wording. Do not send PII to GA4/pixels or include full lead details in notification emails.

Capture attribution: source_site `sellmykernhome.com`, lead_type `seller`, landing URL, referrer, UTMs, timestamp, and consent version/time.

## 6. Shared GNZ Admin and Supabase
Inspect existing schema and extend rather than replace. Proposed fields to map into existing lead model: lead_id, lead_type, source_site, status, name, email, phone, preferred_contact, property_address, property_city, property_zip, property_type, condition, occupancy, timing, notes, attribution, consent, created_at, updated_at, assigned_to.

Admin: All / Seller / Investor filters, source labels, searchable lead queue, detail view, notes, assignment, status progression, notifications, and restricted CSV export if consistent with existing Admin. Suggested stages: New, Contacted, Qualified, In Discussion, Closed, Not Proceeding. Ensure RLS deny-by-default, authorized mutations, audit logging, no publicly readable seller records, and regression tests on GNZ investor/contact flows. Never store lead data only in browser localStorage.

## 7. SEO and content
Do keyword validation rather than assuming search volume. Candidate intent clusters: sell house Bakersfield, sell as-is Bakersfield, inherited property Kern County, vacant house Bakersfield, rental property sale Kern County. Write original substantive pages that answer actual seller questions; no spun duplicate city pages. Each page needs unique title/meta/H1, canonical, OG metadata, internal links, semantic headings, image alt text, breadcrumbs as appropriate, sitemap, robots.txt, and verified Organization/WebSite structured data. Noindex thank-you, admin, staging, and unpublished pages.

Draft two helpful Insights articles: “What to Consider Before Selling a House As-Is in Bakersfield” and “Questions to Ask Before Signing a Property Purchase Agreement.” Attorney-review legally sensitive material. Add Google Search Console and GA4 setup instructions for new domain; activate when account/domain access is approved. Analytics events: form_start, form_step, seller_lead_submitted, contact_click, call_click. No PII in analytics.

Performance goals: mobile-first, optimize LCP, CLS, INP, and Lighthouse accessibility; document measured results, don't fabricate scores.

## 8. Content and compliance approval checklist
Before public launch Gabe must confirm: actual contracting entity; whether GNZ buys as principal, assigns purchase contracts, double-closes, or only introduces buyers; licensing/legal position; permitted claims about offers, costs and timelines; assignment disclosures; actual phone/email/address; approved operator biography/photo; privacy policy, terms, consent, and data retention. Obtain California attorney review. Do not silently infer any of these from Bakersfield Cash Offer.

## 9. First 30 days
**Days 1–5:** Audit GNZ architecture and lead backend; repo/site scaffold; original design system; page map; keyword/claim matrix; staging. Deliver integration-audit report and homepage wireframe.

**Days 6–10:** Build responsive homepage, process, situations hub, About, FAQ, Contact, and footer. Deliver clickable staging UI and mobile screenshots.

**Days 11–15:** Implement validated seller form, secure API, Supabase integration and Admin seller filters, anti-spam, notifications, and RLS tests. Deliver end-to-end staging submission.

**Days 16–20:** Complete five situation pages, two articles, technical SEO, sitemap, schema, canonical metadata, and conversion instrumentation. Deliver SEO mapping and content approval list.

**Days 21–25:** Browser/mobile testing at 375, 390, 430, 768, 1280, 1440 widths; accessibility; broken links; forms; security; RLS; notification retries; performance; GNZ regression testing. Deliver QA report and preview URL.

**Days 26–30:** Resolve critical/high issues; prepare client walkthrough, approval checklist, deployment runbook, and final backlog. Deliver review-ready candidate, not automatic production launch. Original two-site Proposal B allows 45–60 days total; use remaining 15–30 days for approvals, fixes, DNS/SSL, production launch, Search Console verification, and post-launch QA.

## 10. Codex work packages
Execute in checkpoints and report after each: (A) architecture audit, (B) design and site skeleton, (C) form + secure integration, (D) content + SEO, (E) testing and review build. Do not attempt broad GNZ database refactors. If a blocker requires legal/client input, proceed on unaffected tasks and record it explicitly.

## 11. Acceptance criteria
- Standalone original site, polished desktop/mobile, accessible and fast.
- All approved pages and links functional; no fake claims, results, or staff details.
- Seller inquiry stored securely, source-tagged, visible only to authorized GNZ admins; notifications work.
- Existing GNZ site, investor funnel, and Admin functions unaffected.
- SEO metadata, sitemap, robots, canonical, and analytics ready and tested.
- Lint, build, tests, security checks, and mobile screenshots delivered.
- Written client/legal approval gates documented; public deployment withheld pending authorization.

## 12. Final Codex report format
Provide: changed files; architecture decisions; migrations and rollback; environment variables needed (names only); staging link; screenshots; lint/build/test results; form submission evidence using synthetic data; RLS results; SEO audit results; unresolved client/legal questions; production launch checklist; time estimate for remaining work.
