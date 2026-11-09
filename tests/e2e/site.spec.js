import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import path from "node:path";

test("homepage, navigation, and seller form are accessible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your Home. Your Options. Your Decision.");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  const heroCta = page.locator('[data-analytics-event="primary_cta_click"][data-analytics-location="homepage_hero"]');
  await expect(heroCta).toHaveAccessibleName("Tell Us About Your Property");
  await expect(heroCta).toHaveAttribute("href", "#property-form");
  await expect(page.getByText("No obligation to sell.", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Property street address")).toBeVisible();
  const continueButton = page.getByRole("button", { name: "Continue" });
  await expect(continueButton).toBeDisabled();
  await page.getByLabel("Property street address").fill("123 Test Street");
  await page.getByLabel("City").fill("Bakersfield");
  await page.getByLabel("ZIP code").fill("93301");
  await page.getByLabel("Your name").fill("Synthetic Seller");
  await page.getByLabel("Email address").fill("seller@example.test");
  await expect(continueButton).toBeDisabled();
  const privacy = page.getByRole("checkbox", { name: /I understand Sell My Kern Home/ });
  await privacy.check();
  await expect(privacy).toBeChecked();
  await expect(continueButton).toBeEnabled();
  await continueButton.click();
  await expect(page.getByRole("heading", { name: "Add property details" })).toBeVisible();
  expect(page.url()).not.toContain("Synthetic%20Seller");
  expect(await page.title()).not.toContain("Synthetic Seller");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("phone contact formats as a US number and uses the brand radio accent", async ({ page }) => {
  await page.goto("/");
  const phoneChoice = page.getByRole("radio", { name: "Phone" });
  await phoneChoice.check();
  const phone = page.getByLabel("Phone number");
  await phone.fill("6613451154");
  await expect(phone).toHaveValue("(661) 345-1154");
  await phone.press("End");
  await phone.press("Backspace");
  await expect(phone).toHaveValue("(661) 345-115");
  await expect(phoneChoice).toHaveCSS("accent-color", "rgb(20, 93, 73)");
});

test("required routes return useful pages", async ({ page }) => {
  for (const route of ["/how-it-works","/selling-situations","/sell-your-house-bakersfield","/sell-house-as-is-bakersfield","/sell-inherited-house-bakersfield","/sell-house-needs-repairs-bakersfield","/sell-rental-property-bakersfield","/selling-situations/vacant-property","/selling-situations/relocating","/about","/faq","/contact","/privacy-policy","/terms","/insights","/insights/selling-a-house-as-is-bakersfield","/insights/selling-inherited-property-kern-county","/insights/options-when-house-needs-major-repairs","/insights/questions-before-signing-property-purchase-agreement"]) {
    const response = await page.goto(route); expect(response.ok(), route).toBeTruthy(); await expect(page.locator("h1")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${route} horizontal overflow`).toBeLessThanOrEqual(1);
  }
});

test("Bakersfield selling-path comparison is readable and accessible", async ({ page }) => {
  await page.goto("/sell-your-house-bakersfield");
  await expect(page).toHaveTitle(/Sell Your House in Bakersfield/);
  const comparison = page.getByRole("region", { name: "Home-selling path comparison" });
  await expect(comparison).toBeVisible();
  await expect(comparison.getByRole("columnheader", { name: "Traditional market listing" })).toBeVisible();
  await expect(comparison.getByRole("columnheader", { name: "Direct or cash proposal" })).toBeVisible();
  await expect(comparison.getByRole("rowheader", { name: "Price and net proceeds" })).toBeVisible();
  const results = await new AxeBuilder({ page }).include(".seller-comparison").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const blocking = results.violations.filter((item) => ["serious", "critical"].includes(item.impact));
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
});

test("superseded situation aliases redirect to canonical seller pages", async ({ request }) => {
  const aliases = new Map([
    ["/selling-situations/inherited-property", "/sell-inherited-house-bakersfield"],
    ["/selling-situations/house-needs-repairs", "/sell-house-needs-repairs-bakersfield"],
    ["/selling-situations/rental-property", "/sell-rental-property-bakersfield"],
  ]);
  for (const [route, destination] of aliases) {
    const response = await request.get(route, { maxRedirects: 0 });
    expect(response.status(), route).toBe(308);
    expect(new URL(response.headers().location, "http://127.0.0.1:3000").pathname, route).toBe(destination);
  }
  expect((await request.get("/selling-situations/not-a-real-situation")).status()).toBe(404);
});

test("indexing gate renders noindex while allowing crawlers to discover it", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://sellmykernhome.com");
  await page.goto("/sell-your-house-bakersfield");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://sellmykernhome.com/sell-your-house-bakersfield");
  const robotsResponse = await request.get("/robots.txt");
  expect(robotsResponse.ok()).toBeTruthy();
  const robots = await robotsResponse.text();
  expect(robots).toContain("Allow: /");
  expect(robots).not.toContain("Disallow: /\n");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).not.toContain("/insights/");
});

test("homepage has no serious or critical accessibility violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const blocking = results.violations.filter((item) => ["serious", "critical"].includes(item.impact));
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
});

test("both contact-form steps have no serious or critical accessibility violations", async ({ page }) => {
  await page.goto("/contact");
  const analyze = async () => {
    const results = await new AxeBuilder({ page }).include("#property-form").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    return results.violations.filter((item) => ["serious", "critical"].includes(item.impact));
  };
  expect(await analyze()).toEqual([]);
  await page.getByLabel("Property street address").fill("123 Test Street");
  await page.getByLabel("City").fill("Bakersfield");
  await page.getByLabel("ZIP code").fill("93301");
  await page.getByLabel("Your name").fill("Synthetic Seller");
  await page.getByLabel("Email address").fill("seller@example.test");
  await page.getByRole("checkbox", { name: /I understand Sell My Kern Home/ }).check();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Add property details" })).toBeVisible();
  expect(await analyze()).toEqual([]);
});

test("captures the homepage review layout", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.screenshot({ path: path.resolve("docs", "screenshots", `${testInfo.project.name}-homepage.png`), fullPage: true });
});

