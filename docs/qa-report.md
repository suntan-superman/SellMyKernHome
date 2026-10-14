# QA report

Status: local review candidate, verified October 14, 2026. External integrations remain gated.

| Area | Status | Evidence / remaining work |
|---|---|---|
| Required routes and links | Pass | Every specified route returned successfully in Playwright |
| Responsive widths | Pass | 375, 390, 430, 768, 1280, and 1440; no horizontal overflow; screenshots saved |
| Form validation | Pass | Email/phone preference, consent, enums, bot timing, name mapping, and two-stage transition |
| Secure storage | Partially verified | Service connection and base lead table pass; seller migration is not present |
| RLS | Partially verified | Anonymous live read denied; write and seller-policy tests require approved migration execution |
| Admin authentication | Pass | Both configured accounts authenticated and are present in `admin_users` |
| Notifications | Partially verified | Key and two recipients configured; send-only key prevents domain lookup; no live email sent |
| Existing GNZ regression | Pass locally | 6 tests, lint, and production build pass; live DB flows still require staging migration |
| SEO | Pass with launch gate | Index-enabled Lighthouse SEO 100; staging-safe score 69 solely because crawl is blocked |
| Accessibility | Pass | Axe: no serious/critical WCAG A/AA issues at six widths; Lighthouse 100 |
| Performance | Pass locally | Lighthouse: Performance 96, LCP 2.8 s, CLS 0, TBT 40 ms, Speed Index 0.9 s |

## Command results

- `npm run lint`: pass
- `npm test`: 15/15 pass, including isolated execution of the hardened migration
- `npm run build`: pass, 23 generated routes/assets
- `npm audit --audit-level=high`: zero vulnerabilities
- `npm run verify:integration`: pass; required environment values, Supabase service access, anonymous read denial, and both Admin memberships verified
- `npm run test:e2e`: 30/30 pass
- GNZ `npm run lint`, `npm test` (8/8), and `npm run build`: pass

## API smoke evidence

Synthetic local requests returned the expected safety results: invalid payload `422`, rejected cross-origin payload `403`, honeypot payload `400`, and valid synthetic payload without configured storage `503`. Read-only live checks then confirmed service access, anonymous read denial, and both Admin memberships. No real lead or PII was created. A stored end-to-end submission and remaining live RLS checks require approved migration execution.

