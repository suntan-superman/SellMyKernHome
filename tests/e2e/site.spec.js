import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import path from "node:path";

test("homepage, navigation, and seller form are accessible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Thinking About Selling");
  await expect(page.getByLabel("Property street address")).toBeVisible();
  const continueButton = page.getByRole("button", { name: "Continue" });
  await expect(continueButton).toBeDisabled();
  await page.getByLabel("Property street address").fill("123 Test Street");
  await page.getByLabel("City").fill("Bakersfield");
  await page.getByLabel("ZIP code").fill("93301");
  await page.getByLabel("Your name").fill("Synthetic Seller");
  await page.getByLabel("Email address").fill("seller@example.test");
  await expect(continueButton).toBeDisabled();
  const privacy = page.getByRole("checkbox", { name: /I understand GNZ Marketing/ });
  await privacy.check();
  await expect(privacy).toBeChecked();
  await expect(continueButton).toBeEnabled();
  await continueButton.click();
  await expect(page.getByRole("heading", { name: "Add property details" })).toBeVisible();
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
  }
});

test("indexing gate renders noindex while allowing crawlers to discover it", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://sellmykernhome.com");
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

test("captures the homepage review layout", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.screenshot({ path: path.resolve("docs", "screenshots", `${testInfo.project.name}-homepage.png`), fullPage: true });
});

