import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("official phone configuration is centralized and normalized", () => {
  const site = read("lib/site.js");
  assert.match(site, /BUSINESS_PHONE_DISPLAY = "\(661\) 518-2801"/);
  assert.match(site, /BUSINESS_PHONE_E164 = "\+16615182801"/);
  assert.match(site, /BUSINESS_PHONE_HREF = `tel:\$\{BUSINESS_PHONE_E164\}`/);
});

test("public phone placements use the shared tracked telephone link", () => {
  const phoneLink = read("components/PhoneLink.js");
  assert.match(phoneLink, /href=\{BUSINESS_PHONE_HREF\}/);
  assert.match(phoneLink, /data-analytics-location=\{location\}/);
  for (const file of ["components/Header.js", "components/Footer.js", "components/CTA.js", "components/PropertyForm.js", "app/page.js"]) {
    assert.match(read(file), /<PhoneLink/);
  }
  assert.match(read("app/page.js"), /telephone: BUSINESS_PHONE_E164/);
  assert.match(read("app/page.js"), /contactPoint:/);
});

test("telephone analytics remains allow-listed and omits the called number", () => {
  const analytics = `${read("components/Analytics.js")}\n${read("lib/analytics.js")}`;
  assert.match(analytics, /href\.startsWith\("tel:"\) \? "phone_click"/);
  assert.match(analytics, /allowedEvents = new Set\(\["phone_click"/);
  assert.doesNotMatch(analytics, /destination: href\.startsWith\("tel:"\)/);
});
