import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("all required public routes exist", () => {
  const routes = ["app/page.js","app/how-it-works/page.js","app/selling-situations/page.js","app/sell-your-house-bakersfield/page.js","app/sell-house-as-is-bakersfield/page.js","app/sell-inherited-house-bakersfield/page.js","app/sell-house-needs-repairs-bakersfield/page.js","app/sell-rental-property-bakersfield/page.js","app/about/page.js","app/faq/page.js","app/contact/page.js","app/privacy-policy/page.js","app/privacy-choices/page.js","app/terms/page.js","app/thank-you/page.js","app/tools/home-sale-net-proceeds-calculator/page.js"];
  for (const route of routes) assert.equal(fs.existsSync(path.join(root, route)), true, route);
});
test("admin login provides an accessible password visibility control", () => {
  const field = read("components/AdminPasswordField.js");
  const page = read("app/admin/login/page.js");
  assert.match(page, /<AdminPasswordField \/>/);
  assert.match(field, /aria-label=\{visible \? "Hide password" : "Show password"\}/);
  assert.match(field, /type=\{visible \? "text" : "password"\}/);
  assert.match(field, /type="button"/);
});
test("crawl controls keep production indexing behind an explicit release gate", () => {
  const layout = read("app/layout.js");
  const robots = read("app/robots.js");
  const nextConfig = read("next.config.js");
  const privacy = read("app/privacy-policy/page.js");
  assert.match(layout, /robots: indexable \? \{ index: true, follow: true \} : \{ index: false, follow: true \}/);
  assert.match(robots, /allow: "\/"/);
  assert.match(robots, /sitemap: indexable \?/);
  assert.doesNotMatch(robots, /demo|staging/i);
  for (const route of ["/admin/:path*", "/api/:path*", "/thank-you"]) {
    assert.match(nextConfig, new RegExp(route.replace(/[/*]/g, "\\$&")));
  }
  assert.match(nextConfig, /X-Robots-Tag/);
  assert.match(nextConfig, /noindex, nofollow, noarchive/);
  assert.match(privacy, /path: "\/privacy-policy", indexable: false/);
});
test("canonical origin and sitemap are permanently domain-scoped", () => {
  assert.match(read("lib/site.js"), /https:\/\/sellmykernhome\.com/);
  assert.match(read("app/sitemap.js"), /if \(!isIndexingEnabled\(\)\) return \[\]/);
  assert.match(read("next.config.js"), /sellmykernhome\.netlify\.app/);
});
test("only the approved as-is article can enter the sitemap", () => {
  const articles = read("content/articles.js");
  const sitemap = read("app/sitemap.js");
  const index = read("app/insights/page.js");
  const route = read("app/insights/[slug]/page.js");
  assert.equal((articles.match(/approvedForIndexing: true/g) || []).length, 1);
  assert.equal((articles.match(/approvedForIndexing: false/g) || []).length, 3);
  assert.match(articles, /slug: "sell-as-is-or-repair-bakersfield"[\s\S]*?approvedForIndexing: true/);
  assert.match(sitemap, /filter\(\(article\) => article\.approvedForIndexing\)/);
  assert.match(index, /\/insights\/sell-as-is-or-repair-bakersfield/);
  assert.match(route, /export const dynamicParams = false/);
  assert.match(route, /articles\.filter\(\(article\) => article\.approvedForIndexing\)/);
  assert.match(route, /if \(!article\?\.approvedForIndexing\) notFound\(\)/);
});
test("approved as-is article includes the authorized comparison, guidance, and role boundaries", () => {
  const articles = read("content/articles.js");
  const route = read("app/insights/[slug]/page.js");
  for (const value of ["$320,000", "$275,000", "$25,000", "$19,200", "$5,500", "$3,000", "$1,000", "$272,800", "$268,500"]) assert.match(articles, new RegExp(value.replace("$", "\\$")));
  assert.match(articles, /hypothetical examples for comparison only/i);
  assert.match(articles, /Selling expenses and real-estate commissions are negotiable/i);
  assert.match(articles, /does not automatically eliminate disclosures/i);
  for (const topic of ["qualifications", "contingencies", "assignment", "closing terms"]) assert.match(articles, new RegExp(topic, "i"));
  for (const href of ["/sell-house-as-is-bakersfield", "/sell-your-house-bakersfield", "/contact"]) assert.match(articles, new RegExp(href));
  assert.match(articles, /https:\/\/www\.dre\.ca\.gov\/files\/pdf\/re6\.pdf/);
  assert.match(route, /"@type": "Article"/);
  assert.match(route, /SHORT_DISCLOSURE_TEXT/);
  assert.match(route, /metadata\.title = \{ absolute: article\.metaTitle \}/);
});
test("net proceeds calculator is indexable, linked, structured, and non-persistent", () => {
  const page = read("app/tools/home-sale-net-proceeds-calculator/page.js");
  const calculator = read("components/NetProceedsCalculator.js");
  const sitemap = read("app/sitemap.js");
  const article = read("content/articles.js");
  const sellerPages = read("content/seller-pages.js");
  const insights = read("app/insights/page.js");
  assert.match(page, /Home Sale Net Proceeds Calculator \| Bakersfield CA/);
  assert.match(page, /path = "\/tools\/home-sale-net-proceeds-calculator"/);
  assert.match(page, /title: \{ absolute: title \}/);
  assert.match(page, /"@type": "WebApplication"/);
  assert.match(page, /hypothetical examples/i);
  assert.match(page, /LeadGenerationDisclosure/);
  assert.match(sitemap, /\/tools\/home-sale-net-proceeds-calculator/);
  for (const source of [article, sellerPages, insights]) assert.match(source, /\/tools\/home-sale-net-proceeds-calculator/);
  assert.doesNotMatch(calculator, /fetch\(|localStorage|sessionStorage|supabase|email/i);
});
test("reviewed seller landing pages are eligible only behind the master indexing gate", () => {
  const pages = read("content/seller-pages.js");
  const sitemap = read("app/sitemap.js");
  assert.equal((pages.match(/approvedForIndexing: true/g) || []).length, 5);
  const sellerTitles = [...pages.matchAll(/metaTitle: "([^"]+)"/g)].map((match) => match[1]);
  assert.equal(sellerTitles.length, 5);
  for (const title of sellerTitles) assert.ok(title.length <= 42, `${title} is too long before the site-name suffix`);
  assert.doesNotMatch(pages, /approvedForIndexing: false/);
  assert.match(sitemap, /if \(!isIndexingEnabled\(\)\) return \[\]/);
  assert.match(sitemap, /filter\(\(\[, page\]\) => page\.approvedForIndexing\)/);
  assert.doesNotMatch(sitemap, /admin|api|thank-you/);
});
test("indexed pages use contextual links and do not promote draft article URLs", () => {
  const related = read("components/RelatedResources.js");
  const sellerPages = read("content/seller-pages.js");
  assert.match(related, /import Link from "next\/link"/);
  assert.match(related, /className="related-links"/);
  for (const route of ["app/how-it-works/page.js", "app/about/page.js", "app/faq/page.js", "app/contact/page.js", "app/insights/page.js"]) {
    assert.match(read(route), /<RelatedResources/);
  }
  assert.equal((sellerPages.match(/\/insights\//g) || []).length, 1);
  assert.match(sellerPages, /\/insights\/sell-as-is-or-repair-bakersfield/);
  for (const draft of ["selling-inherited-property-kern-county", "options-when-house-needs-major-repairs", "questions-before-signing-property-purchase-agreement"]) assert.doesNotMatch(sellerPages, new RegExp(draft));
});
test("Bakersfield option comparison is substantive and preserves claim boundaries", () => {
  const pages = read("content/seller-pages.js");
  const component = read("components/SellerLandingPage.js");
  assert.match(pages, /Traditional market listing/);
  assert.match(pages, /Direct or cash proposal/);
  for (const factor of ["Price and net proceeds", "Preparation and access", "Contingencies and certainty", "Timing and possession", "Professional roles"]) assert.match(pages, new RegExp(factor));
  assert.match(component, /<table>/);
  assert.match(component, /scope="col"/);
  assert.match(component, /scope="row"/);
  assert.match(component, /does not state that SMKH is a cash buyer/);
  assert.doesNotMatch(pages, /close in (?:as little as )?\d|offer (?:today|within \d)|no (?:fees|commissions|closing costs)/i);
});
test("public role disclosures describe the approved service without implying a transaction role", () => {
  const publicCopy = `${read("app/page.js")}\n${read("app/about/page.js")}\n${read("app/contact/page.js")}\n${read("components/PropertyForm.js")}\n${read("components/SellerLandingPage.js")}\n${read("lib/site.js")}`;
  assert.match(publicCopy, /homeowner inquiry and lead-generation service/);
  assert.match(publicCopy, /not a real estate brokerage or property buyer/);
  assert.match(publicCopy, /do not represent buyers or sellers/);
  assert.match(publicCopy, /does not state that SMKH is a cash buyer, brokerage, attorney, tax adviser, or contracting party/);
});
test("structured data identifies Workside as operator and SMKH as its public brand", () => {
  const homepage = read("app/page.js");
  assert.match(homepage, /name: OPERATOR_NAME/);
  assert.match(homepage, /alternateName: SITE_NAME/);
  assert.match(homepage, /brand: \{ "@type": "Brand", name: SITE_NAME \}/);
  assert.doesNotMatch(homepage, /DRE|licenseNumber|brokerage affiliation/i);
});
test("lead consent evidence preserves separate privacy, sharing, and marketing choices", () => {
  const leads = read("lib/leads.js");
  for (const field of ["consent_type", "privacy_version", "privacy_notice_sha256", "privacy_at", "submission_source", "sharing_consent_selected", "sharing_notice_version", "sharing_notice_sha256", "sharing_consent_at", "approved_recipient_snapshot", "sharing_suppressed", "automated_marketing_consent", "marketing_notice_version", "marketing_notice_sha256", "marketing_consent_at", "external_sharing_consent"]) {
    assert.match(leads, new RegExp(field));
  }
  assert.match(leads, /partner\.sharingAvailable/);
  assert.match(read("lib/partner-config.js"), /SMKH_PARTNER_DELIVERY_ENABLED === "true"/);
  assert.match(read("lib/partner-config.js"), /approvedRecipients\.length > 0/);
});
test("privacy opt-out is durable, discoverable, and suppresses future transfers", () => {
  const footer = read("components/Footer.js");
  const route = read("app/api/privacy-requests/route.js");
  const privacy = read("lib/privacy-requests.js");
  const migration = read("supabase/migrations/20261110_smkh_privacy_choices.sql");
  assert.match(footer, /Do Not Sell or Share My Personal Information/);
  assert.match(route, /validatePrivacyRequest/);
  assert.match(route, /verifyTurnstile/);
  assert.match(privacy, /smkh_create_privacy_request/);
  assert.match(privacy, /smkh_is_sharing_suppressed/);
  assert.match(migration, /create table public\.smkh_sharing_suppressions/i);
  assert.match(migration, /external_sharing_consent.*false/is);
  assert.doesNotMatch(migration, /grant[^;]*to (?:public|anon)/i);
});
test("Merxus prompt is limited to first-party lead intake", () => {
  const prompt = read("docs/Merxus_AI_Prompt/Prompt.md");
  assert.match(prompt, /AI assistant helping collect homeowner inquiries for Workside Software/);
  assert.match(prompt, /not a real estate brokerage or property buyer/);
  assert.match(prompt, /does not authorize call recording or transcription/);
  assert.match(prompt, /Do not request permission for external sharing/);
  assert.doesNotMatch(prompt, /property acquisition service|our acquisition team/i);
});
test("homepage uses the approved homeowner brand message and preserves local conversion paths", () => {
  const homepage = read("app/page.js");
  assert.match(homepage, /<h1>Your Home\. Your Options\. Your Decision\.<\/h1>/);
  assert.equal((homepage.match(/<h1>/g) || []).length, 1);
  assert.match(homepage, /selling a house in Bakersfield or Kern County/);
  assert.match(homepage, /Tell Us About Your Property/);
  assert.match(homepage, /href="#property-form"/);
  assert.match(homepage, /No obligation to sell\./);
  assert.match(homepage, /Call anytime — \{BUSINESS_PHONE_SERVICE_LABEL\}\./);
  assert.match(homepage, /data-analytics-event="primary_cta_click"/);
  assert.match(homepage, /data-analytics-location="homepage_hero"/);
});
test("homepage and social metadata use the optimized Craftsman hero image", () => {
  const homepage = read("app/page.js");
  const layout = read("app/layout.js");
  const site = read("lib/site.js");
  const imagePath = "public/images/craftsman-home-exterior-v2.webp";
  assert.equal(fs.existsSync(path.join(root, imagePath)), true, imagePath);
  assert.match(homepage, /src="\/images\/craftsman-home-exterior-v2\.webp"/);
  assert.match(homepage, /alt="Blue-gray Craftsman-style home with a welcoming lit porch and landscaped front walk"/);
  assert.match(layout, /url: "\/images\/craftsman-home-exterior-v2\.webp", width: 1536, height: 1024/);
  assert.match(layout, /images: \["\/images\/craftsman-home-exterior-v2\.webp"\]/);
  assert.match(site, /url: "\/images\/craftsman-home-exterior-v2\.webp", width: 1536, height: 1024/);
  assert.doesNotMatch(`${homepage}\n${layout}\n${site}`, /modern-home-exterior/);
});
test("situation aliases do not create duplicate indexable pages", () => {
  const route = read("app/selling-situations/[slug]/page.js");
  assert.match(route, /export const dynamicParams = false/);
  assert.match(route, /situations\.filter\(isDedicatedSituationPage\)/);
  assert.match(route, /if \(!isDedicatedSituationPage\(item\)\) notFound\(\)/);
});
test("FAQ schema mirrors visible questions and seller guides cite public authorities", () => {
  const faq = read("app/faq/page.js");
  const seller = read("components/SellerLandingPage.js");
  const pages = read("content/seller-pages.js");
  assert.match(faq, /"@type": "FAQPage"/);
  assert.match(faq, /mainEntity: faqs\.map/);
  assert.match(seller, /Authoritative public resources/);
  assert.match(seller, /target="_blank" rel="noreferrer"/);
  assert.match(pages, /https:\/\/www\.dre\.ca\.gov\//);
  assert.match(pages, /https:\/\/selfhelp\.courts\.ca\.gov\/probate/);
  assert.match(pages, /https:\/\/www\.kern\.courts\.ca\.gov\/divisions\/probate/);
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
test("PI workflow is empty, additive, and least-privilege", () => {
  const sql = read("supabase/migrations/20261101_smkh_property_intelligence.sql");
  assert.match(sql, /create table public\.smkh_leads/i);
  assert.match(sql, /create table public\.smkh_admin_memberships/i);
  assert.doesNotMatch(sql, /gnz|cutpro|legacy_gnz|from public\.admin_users/i);
  assert.match(sql, /alter table public\.smkh_leads enable row level security/i);
  assert.match(sql, /grant select, insert on public\.smkh_leads to service_role/i);
  assert.match(sql, /grant execute on function public\.smkh_check_rate_limit[\s\S]*?to service_role/i);
  assert.doesNotMatch(sql, /insert into public\.smkh_leads[\s\S]*?select/i);
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
test("calculator analytics are consent-gated and never include financial inputs", () => {
  const analytics = read("lib/analytics.js");
  const calculator = read("components/NetProceedsCalculator.js");
  for (const event of ["calculator_view", "calculator_interaction", "calculator_cta_click"]) assert.match(analytics, new RegExp(event));
  assert.match(calculator, /track\("calculator_view", \{ location: "net_proceeds_calculator" \}\)/);
  assert.match(calculator, /track\("calculator_interaction", \{ location: "net_proceeds_calculator" \}\)/);
  assert.match(calculator, /data-analytics-event="calculator_cta_click"/);
  assert.doesNotMatch(calculator, /track\([^\n]*(?:salePrice|repairBudget|mortgagePayoff|sellingExpense)/);
  assert.doesNotMatch(analytics, /"sale_price"|"mortgage"|"repair_budget"|"financial_value"/);
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
  assert.match(analytics, /window\[`ga-disable-\$\{measurementId\}`\]/);
  assert.match(analytics, /clearAnalyticsCookies/);
  assert.match(analytics, /isExcludedPath/);
  assert.match(analytics, /pathname === "\/admin" \|\| pathname\.startsWith\("\/admin\/"\)/);
  assert.doesNotMatch(analytics, /useSearchParams|window\.location\.search/);
});

test("Netlify production builds fail closed on PI identity and launch gates", () => {
  const verification = read("scripts/verify-production-config.mjs");
  assert.match(verification, /jsrvdryddojhkmjzotef/);
  assert.match(verification, /sroy@worksidesoftware\.com/);
  assert.match(verification, /Workside Software/);
  assert.match(verification, /SMKH_NOTIFICATIONS_ENABLED[^\n]+"false"/);
  assert.match(verification, /NEXT_PUBLIC_ROBOTS_INDEX[^\n]+"true"/);
  assert.match(verification, /NEXT_PUBLIC_GA_MEASUREMENT_ID/);
  assert.match(verification, /\^G-\[A-Z0-9\]\+\$/);
  assert.match(verification, /smkh_admin_memberships/);
  assert.doesNotMatch(verification, /console\.log\([^)]*(?:secretKey|publishableKey)/);
});
test("seller endpoint validates before server-side lead creation", () => {
  const route = read("app/api/leads/route.js");
  assert.match(route, /candidate === requestOrigin/);
  assert.match(route, /candidate === new URL\(SITE_URL\)\.origin/);
  assert.match(route, /validateSellerLead\(input\)/);
  assert.match(route, /passesHoneypot\(validation\.data\)/);
  assert.match(route, /verifyTurnstile\(input\.turnstileToken, ip\)/);
  assert.match(route, /createSellerLead\(validation\.data, \{ partner \}\)/);
});

