# Preview and production deployment runbook

## Preview (authorized build target)

1. Create a separate GitHub repository and connect a separate Netlify site.
2. Use `npm run build`, publish `.next`, and Node 20. Keep `NEXT_PUBLIC_ROBOTS_INDEX=false`.
3. Add environment variables by name from `.env.example`; never commit values.
4. Add the preview hostname to Turnstile. Confirm form failure is safe before credentials and succeeds only after the reviewed staging migration.
5. Run lint, unit tests, build, browser tests, broken-link checks, keyboard testing, and synthetic submission evidence.

## Staging database sequence

1. Complete the backup and read-only preflight in migration-safety-and-rollback.md; record and verify the restore point.
2. Confirm `gnz_leads` and its named constraints match `docs/integration-audit.md`.
3. Review and run the additive migration in staging only.
4. Deploy compatible GNZ Admin code; verify All/Seller/Investor filters and existing investor/contact records.
5. Submit synthetic data (`example.test` contact values), verify source/consent/attribution/audit/delivery records, then delete it under the approved testing policy.

## Production gate

Do not proceed without every item in `client-legal-approval-checklist.md`, explicit production authorization, a database owner, a deployment owner, and a rollback decision window.

After authorization: back up; migrate; deploy GNZ Admin; deploy this site; run synthetic smoke tests; verify logs; attach the domain; confirm DNS/SSL; set the production URL; enable indexing only after final QA; verify Search Console and sitemap; enable approved GA4; monitor errors and notifications.

## Rollback

Prefer the non-destructive application procedure in migration-safety-and-rollback.md. The database migration is additive and should normally remain in place while code is rolled back. The supplied SQL rollback is guarded, drops seller data and shared columns, and is a last resort requiring a verified backup, impact review, and explicit approval.

