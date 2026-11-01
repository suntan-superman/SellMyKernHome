# Direct production deployment runbook

The owner canceled the former preview/staging plan on 2026-11-01. Do not create staging sites, staging databases, staging branches, or additional infrastructure. The authoritative database procedure is [`SMKH_DIRECT_PRODUCTION_RUNBOOK.md`](SMKH_DIRECT_PRODUCTION_RUNBOOK.md).

## Production gate

Do not deploy until the owner approves the reviewed release commit and migration checksum. Before any database write, verify the existing Supabase project identity, create and restore-test a recoverable backup, record live schema/count/permission baselines, and pass the read-only preflight. Stop on drift.

Apply the independent SMKH migration exactly once only after authorization, using the verified owner context and commands in the authoritative runbook. No GNZ Admin membership is copied; exactly one verified existing Supabase Auth user is bootstrapped as the independent SMKH owner. Run postflight before deploying application code. Existing GNZ records and authentication users must remain unchanged.

## Application release

Deploy the owner-approved Git commit through the existing GitHub-connected Netlify site. Configure only the environment names documented in `.env.example`. Keep `NEXT_PUBLIC_ROBOTS_INDEX=false` and `SMKH_NOTIFICATIONS_ENABLED=false` until their separate readiness checks pass. Do not send a production synthetic lead without explicit authorization.

## Recovery

Prefer restoring the previously deployed application commit while retaining the independent SMKH records. Disable intake and notifications if required. Do not automatically drop database objects or delete copied/new lead records.
