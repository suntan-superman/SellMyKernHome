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
test("migration denies browser roles and includes audit and delivery logs", () => { const sql = read("supabase/migrations/20261014_sellmykernhome_leads.sql"); assert.match(sql, /revoke all[\s\S]+anon, authenticated/i); assert.match(sql, /smkh_lead_audit/); assert.match(sql, /smkh_notification_logs/); assert.match(sql, /security definer/); });
test("notification body intentionally excludes seller PII fields", () => { const source = read("lib/notifications.js"); assert.doesNotMatch(source, /lead\.(email|phone|property_address|propertyAddress|first_name|last_name)/); });
test("analytics filters common PII parameter names", () => assert.match(read("lib/analytics.js"), /name\|email\|phone\|address\|notes\|comment/));

