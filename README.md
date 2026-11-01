# Sell My Kern Home

Standalone Next.js review build for a compliance-first Bakersfield and Kern County seller inquiry funnel. Public production launch is intentionally withheld pending owner and California legal approval.

## Local setup

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Open `http://127.0.0.1:3000`. The UI works without external credentials. API submissions return a setup response until Supabase is configured. In production, Turnstile configuration is mandatory.

## Verification

```powershell
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

## Data integration

The production target is the existing PropertyIntelligence Supabase project. The additive, PI-only migration `supabase/migrations/20261101_smkh_property_intelligence.sql` was applied and certified on 2026-11-01 with SHA-256 `C290C893CD70207CE2CB157C677AA10DE4E06A45B0F7F067E39E3303EA30917C`. It created an empty independent SMKH workflow and did not import records from another project. Follow `docs/SMKH_DIRECT_PRODUCTION_RUNBOOK.md`; do not rerun the migration or execute a destructive rollback.

All Supabase writes occur server-side. Browser-safe variables use the `NEXT_PUBLIC_` prefix; the service credential never does. Seller notifications contain a reference and secure Admin link, not full lead details.

## Deployment gate

Deploy only after the PI migration, postflight, and Netlify environment cutover receive explicit owner approval. Keep `NEXT_PUBLIC_ROBOTS_INDEX=false` and `SMKH_NOTIFICATIONS_ENABLED=false`; do not change DNS, enable indexing/analytics, or publish legal drafts until their separate approval gates are complete.

