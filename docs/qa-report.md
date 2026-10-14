# QA report

Status: local review candidate, verified October 14, 2026. External integrations remain gated.

| Area | Status | Evidence / remaining work |
|---|---|---|
| Required routes and links | Pass | Every specified route returned successfully in Playwright |
| Responsive widths | Pass | 375, 390, 430, 768, 1280, and 1440; no horizontal overflow; screenshots saved |
| Form validation | Pass | Email/phone preference, consent, enums, bot timing, name mapping, and two-stage transition |
| Secure storage | Blocked by staging credentials | Server-only adapter and reviewed migration prepared |
| RLS | Static check added; live test blocked | Requires approved staging Supabase branch and credentials |
| Notifications | Static privacy check added; live test blocked | Delivery log implemented; provider credentials needed |
| Existing GNZ regression | Pass locally | 6 tests, lint, and production build pass; live DB flows still require staging migration |
| SEO | Pass with launch gate | Index-enabled Lighthouse SEO 100; staging-safe score 69 solely because crawl is blocked |
| Accessibility | Pass | Axe: no serious/critical WCAG A/AA issues at six widths; Lighthouse 100 |
| Performance | Pass locally | Lighthouse: Performance 96, LCP 2.8 s, CLS 0, TBT 40 ms, Speed Index 0.9 s |

## Command results

- `npm run lint`: pass
- `npm test`: 10/10 pass
- `npm run build`: pass, 23 generated routes/assets
- `npm audit --audit-level=high`: zero vulnerabilities
- `npm run test:e2e`: 30/30 pass
- GNZ `npm run lint`, `npm test`, and `npm run build`: pass

## API smoke evidence

Synthetic local requests returned the expected safety results: invalid payload `422`, rejected cross-origin payload `403`, honeypot payload `400`, and valid synthetic payload without configured storage `503`. No real lead or PII was created. A stored end-to-end submission and live RLS checks require approved staging credentials and migration execution.

