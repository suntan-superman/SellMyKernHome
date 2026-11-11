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
  const calculatorCta = page.getByRole("link", { name: "Use the Free Net Proceeds Calculator" });
  await expect(calculatorCta).toBeVisible();
  await expect(calculatorCta).toHaveAttribute("href", "/tools/home-sale-net-proceeds-calculator");
  const insightsToggle = page.locator("#insights-navigation-button");
  await expect(insightsToggle).toHaveAttribute("aria-expanded", "false");
  await expect(insightsToggle).toHaveAttribute("aria-controls", "insights-navigation-menu");
  await expect(page.locator('#insights-navigation-menu a[href="/tools/home-sale-net-proceeds-calculator"]')).toHaveText("Net Proceeds Calculator");
  await expect(page.locator('#insights-navigation-menu a[href="/tools/home-carrying-cost-calculator"]')).toHaveText("Carrying Costs Calculator");
  const latestGuide = page.getByRole("link", { name: "Sell As-Is or Make Repairs? A Bakersfield Homeowner's Guide" }).first();
  await expect(latestGuide).toBeVisible();
  await expect(latestGuide).toHaveAttribute("href", "/insights/sell-as-is-or-repair-bakersfield");
  await expect(page.getByRole("link", { name: "View all homeowner guides" })).toHaveAttribute("href", "/insights");
  await expect(page.getByRole("link", { name: "Take the Selling Options Quiz" })).toHaveAttribute("href", "/tools/which-selling-option-fits-me");
  await expect(page.getByText("No obligation to sell.", { exact: true })).toBeVisible();
  const heroImage = page.locator('.hero-visual img[src*="craftsman-home-exterior-v2"]');
  await expect(heroImage).toBeVisible();
  await expect.poll(() => heroImage.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(page.getByLabel("Property street address")).toBeVisible();
  const continueButton = page.getByRole("button", { name: "Continue" });
  await expect(continueButton).toBeDisabled();
  await page.getByLabel("Property street address").fill("123 Test Street");
  await page.getByLabel("City").fill("Bakersfield");
  await page.getByLabel("ZIP code").fill("93301");
  await page.getByLabel("Your name").fill("Synthetic Seller");
  await page.getByLabel("Email address").fill("seller@example.test");
  await expect(continueButton).toBeDisabled();
  const privacy = page.getByRole("checkbox", { name: /I acknowledge the Privacy Policy/ });
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

test("expanded primary navigation fits before the mobile breakpoint", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto("/");
  const navigation = page.locator("#primary-navigation");
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole("button", { name: "Insights", exact: true })).toBeVisible();
  const [navigationBox, shellBox, logoBox, actionsBox] = await Promise.all([navigation.boundingBox(), page.locator(".nav-shell").boundingBox(), page.locator(".site-header .logo").boundingBox(), page.locator(".header-actions").boundingBox()]);
  expect(navigationBox.x).toBeGreaterThanOrEqual(shellBox.x);
  expect(navigationBox.x + navigationBox.width).toBeLessThanOrEqual(shellBox.x + shellBox.width + 1);
  expect(logoBox.x + logoBox.width).toBeLessThanOrEqual(actionsBox.x);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("Insights disclosure navigation is keyboard and mobile accessible", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Insights", exact: true });
  const submenu = page.locator("#insights-navigation-menu");
  await expect(submenu).toBeHidden();
  await toggle.focus();
  await toggle.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(submenu).toBeVisible();
  await expect(submenu.getByRole("link")).toHaveText(["Overview", "Articles", "Carrying Costs Calculator", "Net Proceeds Calculator", "Best Selling Options Quiz"]);
  const desktopAccessibility = await new AxeBuilder({ page }).include(".site-header").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(desktopAccessibility.violations.filter((item) => ["serious", "critical"].includes(item.impact))).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
  await toggle.press("Space");
  await expect(submenu).toBeVisible();
  await page.locator("main").click({ position: { x: 5, y: 5 } });
  await expect(submenu).toBeHidden();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.getByRole("button", { name: "Open menu" }).click();
  const mobileToggle = page.getByRole("button", { name: "Insights", exact: true });
  await expect(mobileToggle).toBeVisible();
  await mobileToggle.click();
  await expect(submenu).toBeVisible();
  for (const link of await submenu.getByRole("link").all()) {
    const box = await link.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  const mobileAccessibility = await new AxeBuilder({ page }).include(".site-header").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(mobileAccessibility.violations.filter((item) => ["serious", "critical"].includes(item.impact))).toEqual([]);
  await submenu.getByRole("link", { name: "Articles", exact: true }).click();
  await expect(page).toHaveURL(/\/insights#articles$/);
  await expect(page.locator("#articles")).toBeVisible();
  await expect(page.locator("#primary-navigation")).not.toHaveClass(/nav-open/);
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

test("required public routes return useful pages", async ({ page }) => {
  for (const route of ["/how-it-works","/selling-situations","/sell-your-house-bakersfield","/sell-house-as-is-bakersfield","/sell-inherited-house-bakersfield","/sell-house-needs-repairs-bakersfield","/sell-rental-property-bakersfield","/selling-situations/vacant-property","/selling-situations/relocating","/about","/faq","/contact","/privacy-policy","/privacy-choices","/terms","/insights","/tools/home-carrying-cost-calculator","/tools/which-selling-option-fits-me"]) {
    const response = await page.goto(route); expect(response.ok(), route).toBeTruthy(); await expect(page.locator("h1")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${route} horizontal overflow`).toBeLessThanOrEqual(1);
  }
});

test("the approved as-is article is public while the other drafts remain inaccessible", async ({ page, request }) => {
  const approved = "sell-as-is-or-repair-bakersfield";
  const drafts = ["selling-inherited-property-kern-county", "options-when-house-needs-major-repairs", "questions-before-signing-property-purchase-agreement"];
  await page.goto("/insights");
  await expect(page.locator(`a[href="/insights/${approved}"]`).first()).toBeVisible();
  const articleResponse = await page.goto(`/insights/${approved}`);
  expect(articleResponse.ok()).toBeTruthy();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sell As-Is or Make Repairs? A Bakersfield Homeowner's Guide");
  await expect(page.getByRole("region", { name: "Hypothetical net-proceeds comparison" })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://sellmykernhome.com/insights/${approved}`);
  await expect(page.locator("h1")).toHaveCount(1);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.goto("/insights");
  for (const slug of drafts) {
    await expect(page.locator(`a[href="/insights/${slug}"]`)).toHaveCount(0);
    expect((await request.get(`/insights/${slug}`)).status(), slug).toBe(404);
  }
});

test("net proceeds calculator updates, resets, and remains responsive", async ({ page }) => {
  const response = await page.goto("/tools/home-sale-net-proceeds-calculator");
  expect(response.ok()).toBeTruthy();
  await expect(page).toHaveTitle("Home Sale Net Proceeds Calculator | Bakersfield CA");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Free Home Sale Net Proceeds Calculator");
  await expect(page.getByTestId("repair-net")).toHaveText("$272,800.00");
  await expect(page.getByTestId("as-is-net")).toHaveText("$268,500.00");
  await expect(page.getByTestId("difference")).toHaveText("$4,300.00");

  await page.getByLabel("Estimated repair budget").fill("0");
  await expect(page.getByTestId("repair-net")).toHaveText("$297,800.00");
  await expect(page.getByTestId("difference")).toHaveText("$29,300.00");
  await page.getByLabel(/Outstanding mortgage and lien payoff/).fill("100000");
  await expect(page.getByTestId("repair-net")).toHaveText("$197,800.00");
  await expect(page.getByTestId("as-is-net")).toHaveText("$168,500.00");
  await expect(page.getByTestId("difference")).toHaveText("$29,300.00");

  await page.getByRole("button", { name: "Reset Example" }).click();
  await expect(page.getByLabel("Estimated repair budget")).toHaveValue("25000");
  await expect(page.getByTestId("repair-net")).toHaveText("$272,800.00");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://sellmykernhome.com/tools/home-sale-net-proceeds-calculator");
  await expect(page.locator("h1")).toHaveCount(1);
  const calculationDetails = page.locator("details.calculation-details");
  const calculationSummary = calculationDetails.locator("summary");
  await expect(calculationDetails).not.toHaveAttribute("open", "");
  await calculationSummary.focus();
  await calculationSummary.press("Enter");
  await expect(calculationDetails).toHaveAttribute("open", "");
  await calculationSummary.press("Enter");
  await expect(calculationDetails).not.toHaveAttribute("open", "");
  await page.emulateMedia({ media: "print" });
  await expect(calculationDetails.locator(".calculation-breakdowns")).toHaveCSS("display", "grid");
  await page.emulateMedia({ media: "screen" });
  const definitions = page.getByText("How the calculator works and input definitions", { exact: true });
  await definitions.focus();
  await definitions.press("Enter");
  await expect(page.getByRole("heading", { name: "Selling expenses" })).toBeVisible();
  await expect(page.getByText(/homeowner inquiry and lead-generation service operated by Workside Software/i).first()).toBeVisible();
  for (const href of ["/tools/which-selling-option-fits-me", "/insights/sell-as-is-or-repair-bakersfield", "/sell-house-as-is-bakersfield", "/sell-your-house-bakersfield", "/contact"]) await expect(page.locator(`.calculator-related a[href="${href}"]`)).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  const results = await new AxeBuilder({ page }).include(".calculator-shell").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const blocking = results.violations.filter((item) => ["serious", "critical"].includes(item.impact));
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
});

test("selling options quiz supports navigation, restart, results, and optional form context", async ({ page }) => {
  const response = await page.goto("/tools/which-selling-option-fits-me");
  expect(response.ok()).toBeTruthy();
  await expect(page).toHaveTitle("Which Home Selling Option Fits Me? | Bakersfield CA");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Which Selling Option Fits Me?");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://sellmykernhome.com/tools/which-selling-option-fits-me");
  expect(await page.locator('script[type="application/ld+json"]').first().textContent()).toContain("WebApplication");
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeDisabled();

  const completeQuiz = async () => {
    await page.getByRole("radio", { name: "Move-in ready" }).check();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("radio", { name: "As soon as practical" }).check();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("button", { name: /Back/ }).click();
    await page.getByRole("radio", { name: "Within 3–6 months" }).check();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("radio", { name: "No", exact: true }).check();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("radio", { name: "Owner occupied" }).check();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("radio", { name: "No known mortgage or liens" }).check();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("radio", { name: "Maximizing potential sale price" }).check();
    await page.getByRole("button", { name: "See My Results" }).click();
    await expect(page.getByRole("heading", { name: "Traditional listing may be worth exploring" })).toBeVisible();
  };

  await completeQuiz();
  expect(await page.evaluate(() => window.sessionStorage.getItem("smkh_selling_quiz_context"))).toBeNull();
  await page.getByRole("button", { name: "Restart quiz" }).click();
  await expect(page.getByText("Question 1 of 6")).toBeVisible();
  await completeQuiz();
  await page.getByRole("checkbox", { name: "Include my quiz answers with my inquiry." }).check();
  const summary = page.getByLabel("Review or edit the summary before continuing");
  await expect(summary).toHaveValue(/Move-in ready/);
  await summary.fill(`${await summary.inputValue()}\nHomeowner note: compare written options.`);
  await page.locator(".quiz-results .quiz-actions").getByRole("link", { name: "Tell Us About Your Property" }).click();
  await expect(page).toHaveURL(/\/#property-form$/);
  expect(page.url()).not.toContain("Move-in");
  await page.getByLabel("Property street address").fill("123 Test Street");
  await page.getByLabel("City").fill("Bakersfield");
  await page.getByLabel("ZIP code").fill("93301");
  await page.getByLabel("Your name").fill("Synthetic Seller");
  await page.getByLabel("Email address").fill("seller@example.test");
  await page.getByRole("checkbox", { name: /I acknowledge the Privacy Policy/ }).check();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByLabel("Selling options quiz summary")).toHaveValue(/Homeowner note: compare written options\./);
  await page.getByRole("button", { name: "Remove quiz summary" }).click();
  await expect(page.getByLabel("Selling options quiz summary")).toHaveCount(0);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  const results = await new AxeBuilder({ page }).include("#property-form").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations.filter((item) => ["serious", "critical"].includes(item.impact))).toEqual([]);
});

test("carrying cost calculator calculates, resets, and transfers one selected scenario", async ({ page }) => {
  const response = await page.goto("/tools/home-carrying-cost-calculator");
  expect(response.ok()).toBeTruthy();
  await expect(page).toHaveTitle("Home Carrying Cost Calculator | Bakersfield & Kern County");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Home Carrying Cost Calculator");
  await expect(page.getByTestId("monthly-carrying-total")).toHaveText("$2,650.00");
  await expect(page.getByTestId("holding-cost-total")).toHaveText("$15,900.00");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://sellmykernhome.com/tools/home-carrying-cost-calculator");
  expect(await page.locator('script[type="application/ld+json"]').first().textContent()).toContain("WebApplication");
  const transferButton = page.getByRole("button", { name: "Use These Costs in Net Proceeds Calculator" });
  await expect(transferButton).toBeDisabled();
  expect(await page.evaluate(() => window.sessionStorage.getItem("smkh_carrying_cost_transfer"))).toBeNull();

  await page.getByRole("spinbutton", { name: "Monthly mortgage payment", exact: true }).fill("0");
  await expect(page.getByTestId("monthly-carrying-total")).toHaveText("$850.00");
  await page.getByRole("spinbutton", { name: "Holding period in months", exact: true }).fill("12");
  await expect(page.getByTestId("holding-cost-total")).toHaveText("$10,200.00");
  await page.getByRole("spinbutton", { name: "Monthly property taxes", exact: true }).fill("-25");
  await expect(page.getByRole("spinbutton", { name: "Monthly property taxes", exact: true })).toHaveValue("0");
  await page.getByRole("button", { name: "Reset Example" }).click();
  await expect(page.getByTestId("monthly-carrying-total")).toHaveText("$2,650.00");
  await expect(page.getByTestId("holding-cost-total")).toHaveText("$15,900.00");

  await page.getByRole("radio", { name: "Repair and list" }).check();
  await expect(transferButton).toBeEnabled();
  await transferButton.click();
  await expect(page).toHaveURL(/\/tools\/home-sale-net-proceeds-calculator$/);
  expect(page.url()).not.toContain("15900");
  await expect(page.getByRole("status")).toContainText("$15,900.00 was applied to Repair and list");
  await expect(page.getByLabel("Estimated carrying costs").first()).toHaveValue("15900");
  await expect(page.getByLabel("Estimated carrying costs").last()).toHaveValue("1000");
  expect(await page.evaluate(() => window.sessionStorage.getItem("smkh_carrying_cost_transfer"))).toBeNull();
  await page.getByLabel("Estimated carrying costs").first().fill("16000");
  await expect(page.getByLabel("Estimated carrying costs").first()).toHaveValue("16000");
  await page.getByRole("button", { name: "Reset Example" }).click();
  await expect(page.getByLabel("Estimated carrying costs").first()).toHaveValue("3000");
  await expect(page.getByLabel("Estimated carrying costs").last()).toHaveValue("1000");

  await page.goto("/tools/home-carrying-cost-calculator");
  for (const label of ["Monthly mortgage payment", "Monthly property taxes", "Monthly homeowners insurance", "Monthly utilities", "Monthly maintenance", "Other monthly costs"]) await page.getByRole("spinbutton", { name: label, exact: true }).fill("0");
  await expect(page.getByTestId("monthly-carrying-total")).toHaveText("$0.00");
  await expect(page.getByTestId("holding-cost-total")).toHaveText("$0.00");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  const results = await new AxeBuilder({ page }).include(".carrying-shell").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations.filter((item) => ["serious", "critical"].includes(item.impact))).toEqual([]);
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
  await page.getByRole("checkbox", { name: /I acknowledge the Privacy Policy/ }).check();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Add property details" })).toBeVisible();
  expect(await analyze()).toEqual([]);
});

test("sharing remains disabled and first-party intake does not require optional marketing", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Property street address").fill("123 Test Street");
  await page.getByLabel("City").fill("Bakersfield");
  await page.getByLabel("ZIP code").fill("93301");
  await page.getByLabel("Your name").fill("Synthetic Seller");
  await page.getByLabel("Email address").fill("seller@example.test");
  await page.getByRole("checkbox", { name: /I acknowledge the Privacy Policy/ }).check();
  await page.getByRole("button", { name: "Continue" }).click();
  const sharing = page.getByRole("checkbox", { name: /I authorize Workside Software to share/ });
  const marketing = page.getByRole("checkbox", { name: /including by automated, prerecorded, or artificial-voice means/ });
  await expect(sharing).toBeDisabled();
  await expect(sharing).not.toBeChecked();
  await expect(marketing).toBeEnabled();
  await expect(marketing).not.toBeChecked();
  await expect(page.getByText(/External partner delivery is currently disabled/).first()).toBeVisible();
  await expect(page.getByText(/Workside Software is a technology company, not a broker or buyer/).first()).toBeVisible();
});

test("privacy choices page exposes a distinct noindex suppression form", async ({ page }) => {
  await page.goto("/privacy-choices");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Control future sharing of your information");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  const button = page.getByRole("button", { name: "Record My Privacy Choice" });
  await expect(button).toBeDisabled();
  await page.getByLabel(/Email address/).fill("seller@example.test");
  await page.getByRole("checkbox", { name: /suppress future sale or sharing/ }).check();
  await expect(page.getByText(/does not automatically retrieve information previously disclosed/).first()).toBeVisible();
});

test("captures the homepage review layout", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.screenshot({ path: path.resolve("docs", "screenshots", `${testInfo.project.name}-homepage.png`), fullPage: true });
});

