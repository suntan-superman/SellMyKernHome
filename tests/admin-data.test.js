import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { leadStatuses, statusLabel } from "../lib/admin-shared.js";

const root = path.resolve(import.meta.dirname, "..");

test("admin workflow exposes the approved independent status model", () => {
  assert.deepEqual(leadStatuses, [
    "new", "contacted", "qualified", "appointment", "offer_made", "under_contract", "closed", "lost",
  ]);
  assert.equal(statusLabel("offer_made"), "Offer Made");
});

test("admin mutations derive the actor from the authenticated database session", () => {
  const route = fs.readFileSync(path.join(root, "app/api/admin/leads/[id]/route.js"), "utf8");
  const data = fs.readFileSync(path.join(root, "lib/admin-data.js"), "utf8");
  const migration = fs.readFileSync(path.join(root, "supabase/migrations/20261101_smkh_independent_workflow.sql"), "utf8");
  assert.doesNotMatch(route, /actor(_id|Id)|user_id/i);
  assert.match(data, /\.rpc\("smkh_update_lead"/);
  assert.match(migration, /verified_actor_id pg_catalog\.uuid := auth\.uid\(\)/);
  assert.match(migration, /set_config\('smkh\.actor_id'.*true\)/);
  assert.match(migration, /revoke all on function public\.smkh_update_lead/);
  assert.match(migration, /to authenticated/);
});

test("migration bootstraps only an explicitly verified owner and never copies GNZ memberships", () => {
  const migration = fs.readFileSync(path.join(root, "supabase/migrations/20261101_smkh_independent_workflow.sql"), "utf8");
  const applyWrapper = fs.readFileSync(path.join(root, "supabase/verification/20261101_smkh_apply_and_postflight.psql"), "utf8");
  assert.match(migration, /smkh\.bootstrap_owner_user_id/);
  assert.match(migration, /supplied owner UUID and email do not match an existing Supabase Auth user/i);
  assert.match(migration, /'owner',\s*true/);
  assert.doesNotMatch(migration, /from public\.admin_users/i);
  assert.match(applyWrapper, /20261101_smkh_set_owner_context\.psql/);
  assert.match(applyWrapper, /20261101_smkh_independent_workflow\.sql/);
  assert.match(applyWrapper, /20261101_smkh_independent_postflight\.sql/);
});

test("production code contains no staging environment selection", () => {
  for (const relative of ["lib/supabase.js", "lib/leads.js", "lib/notifications.js", "netlify.toml", ".env.example"]) {
    const source = fs.readFileSync(path.join(root, relative), "utf8");
    assert.doesNotMatch(source, /STAGING_SUPABASE|DEMO_ACCESS|CONTEXT.*deploy-preview/i, relative);
  }
});
