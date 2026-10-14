import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("all required public routes exist", () => {
  const routes = ["app/page.js","app/how-it-works/page.js","app/selling-situations/page.js","app/about/page.js","app/faq/page.js","app/contact/page.js","app/privacy-policy/page.js","app/terms/page.js","app/thank-you/page.js"];
  for (const route of routes) assert.equal(fs.existsSync(path.join(root, route)), true, route);
});
test("staging is noindexed by default", () => { const robots = read("app/robots.js"); assert.match(robots, /NEXT_PUBLIC_ROBOTS_INDEX/); assert.match(robots, /disallow: "\/"/); });
test("migration reasserts deny-by-default lead security", () => {
  const sql = read("supabase/migrations/20261014_sellmykernhome_leads.sql");
  assert.match(sql, /alter table public\.gnz_leads enable row level security/i);
  assert.match(sql, /revoke all on public\.gnz_leads from public, anon, authenticated/i);
  assert.match(sql, /revoke all privileges on table public\.gnz_leads from service_role/i);
  assert.match(sql, /grant select, insert, update on table public\.gnz_leads to service_role/i);
  assert.doesNotMatch(sql, /grant[^;]*on public\.gnz_leads to (?:public|anon|authenticated)/i);
  assert.doesNotMatch(sql, /grant[^;]*delete[^;]*public\.gnz_leads/i);
});
test("security-definer functions use restricted paths and explicit grants", () => {
  const sql = read("supabase/migrations/20261014_sellmykernhome_leads.sql");
  const definitions = sql.match(/security definer[\s\S]*?\$function\$/gi) || [];
  assert.equal(definitions.length, 3);
  for (const definition of definitions) assert.match(definition, /set search_path = pg_catalog/i);
  assert.match(sql, /revoke all on function public\.smkh_audit_seller_lead\(\)[\s\S]*?from public, anon, authenticated, service_role/i);
  assert.match(sql, /grant execute on function public\.smkh_check_rate_limit[\s\S]*?to service_role/i);
  assert.match(sql, /grant execute on function public\.smkh_admin_update_lead[\s\S]*?to service_role/i);
});
test("admin RPC verifies membership and uses transaction-local actor context", () => {
  const sql = read("supabase/migrations/20261014_sellmykernhome_leads.sql");
  assert.match(sql, /select 1 from public\.admin_users where user_id = p_actor_id/i);
  assert.match(sql, /set_config\('smkh\.actor_id', p_actor_id::pg_catalog\.text, true\)/i);
  assert.match(sql, /actor_kind[\s\S]*?'admin'[\s\S]*?'system'/i);
  assert.match(sql, /current_setting\('smkh\.actor_id', true\)/i);
});
test("rollback is manually gated and documented as destructive", () => {
  const rollback = read("supabase/rollback/20261014_sellmykernhome_leads.rollback.sql");
  const guide = read("docs/migration-safety-and-rollback.md");
  assert.match(rollback, /allow_destructive_rollback/);
  assert.match(rollback, /is distinct from 'yes'/i);
  assert.match(rollback, /in_discussion[\s\S]*not_proceeding/i);
  assert.match(guide, /Preferred non-destructive application rollback/);
  assert.match(guide, /seller leads[\s\S]*audit events[\s\S]*notification records/i);
});
test("notification body intentionally excludes seller PII fields", () => { const source = read("lib/notifications.js"); assert.doesNotMatch(source, /lead\.(email|phone|property_address|propertyAddress|first_name|last_name)/); });
test("analytics filters common PII parameter names", () => assert.match(read("lib/analytics.js"), /name\|email\|phone\|address\|notes\|comment/));
test("seller endpoint validates before server-side lead creation", () => {
  const route = read("app/api/leads/route.js");
  assert.match(route, /validateSellerLead\(input\)/);
  assert.match(route, /passesHoneypot\(validation\.data\)/);
  assert.match(route, /verifyTurnstile\(input\.turnstileToken, ip\)/);
  assert.match(route, /createSellerLead\(validation\.data\)/);
});

