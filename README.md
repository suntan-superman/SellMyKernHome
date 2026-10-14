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

Read `docs/integration-audit.md` first. The proposed additive migration is `supabase/migrations/20261014_sellmykernhome_leads.sql`; it has not been applied. The rollback script is intentionally destructive and must never be run without a verified backup and explicit approval.

All Supabase writes occur server-side. Browser-safe variables use the `NEXT_PUBLIC_` prefix; the service credential never does. Seller notifications contain a reference and secure Admin link, not full lead details.

## Deployment gate

Deploy only to a Netlify preview or branch URL with `NEXT_PUBLIC_ROBOTS_INDEX=false`. Do not attach the custom domain, change DNS, enable indexing/analytics, run the production migration, or publish the legal drafts until the approval checklist is complete.

