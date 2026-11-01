import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("all required public routes exist", () => {
  const routes = ["app/page.js","app/how-it-works/page.js","app/selling-situations/page.js","app/sell-your-house-bakersfield/page.js","app/sell-house-as-is-bakersfield/page.js","app/sell-inherited-house-bakersfield/page.js","app/sell-house-needs-repairs-bakersfield/page.js","app/sell-rental-property-bakersfield/page.js","app/about/page.js","app/faq/page.js","app/contact/page.js","app/privacy-policy/page.js","app/terms/page.js","app/thank-you/page.js"];
  for (const route of routes) assert.equal(fs.existsSync(path.join(root, route)), true, route);
});
test("crawl controls keep production indexing behind an explicit release gate", () => {
  const layout = read("app/layout.js");
  const robots = read("app/robots.js");
  assert.match(layout, /robots: indexable \? \{ index: true, follow: true \} : \{ index: false, follow: true \}/);
  assert.match(robots, /allow: "\/"/);
  assert.match(robots, /sitemap: indexable \?/);
  assert.doesNotMatch(robots, /demo|staging/i);
});
test("canonical origin and sitemap are permanently domain-scoped", () => {
  assert.match(read("lib/site.js"), /https:\/\/sellmykernhome\.com/);
  assert.match(read("app/sitemap.js"), /if \(!isIndexingEnabled\(\)\) return \[\]/);
  assert.match(read("next.config.js"), /sellmykernhome\.netlify\.app/);
});
test("draft educational content cannot enter the sitemap", () => {
  const articles = read("content/articles.js");
  const sitemap = read("app/sitemap.js");
  assert.match(articles, /approvedForIndexing: false/g);
  assert.match(sitemap, /filter\(\(article\) => article\.approvedForIndexing\)/);
});
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
test("independent workflow isolates SMKH records and least-privilege administration", () => {
  const sql = read("supabase/migrations/20261101_smkh_independent_workflow.sql");
  assert.match(sql, /create table if not exists public\.smkh_leads/i);
  assert.match(sql, /create table if not exists public\.smkh_admin_memberships/i);
  assert.match(sql, /where g\.lead_type = 'seller' or g\.source_site = 'sellmykernhome\.com'/i);
  assert.match(sql, /alter table public\.smkh_leads enable row level security/i);
  assert.match(sql, /grant select, insert on public\.smkh_leads to service_role/i);
  assert.doesNotMatch(sql, /delete from public\.gnz_leads|update public\.gnz_leads/i);
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
test("analytics sends only allow-listed non-PII parameters", () => {
  const source = read("lib/analytics.js");
  assert.match(source, /allowedParameters = new Set\(\["location", "destination", "form", "step", "error_count", "source"\]\)/);
  assert.match(source, /allowedParameters\.has\(key\)/);
  assert.doesNotMatch(source, /name", "email|phone", "address|notes|comment/);
});
test("seller funnel uses the approved non-PII event taxonomy", () => {
  const form = read("components/PropertyForm.js");
  const analytics = read("components/Analytics.js");
  for (const event of ["seller_form_start", "seller_form_submit_success", "seller_form_validation_error", "generate_lead"]) assert.match(form, new RegExp(event));
  for (const event of ["primary_cta_click", "phone_click", "email_click"]) assert.match(`${analytics}\n${read("components/CTA.js")}`, new RegExp(event));
  assert.doesNotMatch(form, /seller_lead_submitted|track\("form_start"/);
});
test("analytics requires consent, disables automatic page views, and omits query strings", () => {
  const analytics = read("components/Analytics.js");
  assert.match(analytics, /send_page_view: false/);
  assert.match(analytics, /analytics_storage: value === "granted"/);
  assert.match(analytics, /page_path: pathname/);
  assert.doesNotMatch(analytics, /useSearchParams|window\.location\.search/);
});
test("seller endpoint validates before server-side lead creation", () => {
  const route = read("app/api/leads/route.js");
  assert.match(route, /candidate === requestOrigin/);
  assert.match(route, /candidate === new URL\(SITE_URL\)\.origin/);
  assert.match(route, /validateSellerLead\(input\)/);
  assert.match(route, /passesHoneypot\(validation\.data\)/);
  assert.match(route, /verifyTurnstile\(input\.turnstileToken, ip\)/);
  assert.match(route, /createSellerLead\(validation\.data\)/);
});

