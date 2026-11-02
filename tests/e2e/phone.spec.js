import { test, expect } from "@playwright/test";

test("official call controls are responsive and do not obstruct the inquiry form", async ({ page }, testInfo) => {
  await page.goto("/");
  const headerPhone = page.locator('header a[href="tel:+16615182801"]');
  await expect(headerPhone).toBeVisible();
  await expect(headerPhone).toHaveAttribute("data-analytics-location", "header");
  await expect(page.locator('main a[href="tel:+16615182801"][data-analytics-location="homepage_hero"]')).toContainText("Prefer to Talk? Call (661) 518-2801");
  await expect(page.locator("#property-form")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

  if (testInfo.project.name.startsWith("mobile")) {
    const box = await headerPhone.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }

  await page.goto("/contact");
  await expect(page.locator('#property-form a[href="tel:+16615182801"]')).toContainText("Call (661) 518-2801");
  await page.goto("/sell-your-house-bakersfield");
  await expect(page.locator('.cta-section a[href="tel:+16615182801"]')).toBeVisible();
});

test("one consent-aware PII-safe phone_click is emitted for one click", async ({ page }) => {
  await page.route("https://www.googletagmanager.com/gtag/js**", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await page.addInitScript(() => window.localStorage.setItem("smkh_analytics_consent", "granted"));
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => Boolean(window.__smkhGaInitialized))).toBe(true);
  await page.locator('header a[href="tel:+16615182801"]').evaluate((link) => {
    link.addEventListener("click", (event) => event.preventDefault(), { once: true });
    link.click();
  });
  const phoneEvents = await page.evaluate(() => (window.dataLayer || []).map((entry) => Array.from(entry)).filter(([command, event]) => command === "event" && event === "phone_click"));
  expect(phoneEvents).toHaveLength(1);
  expect(phoneEvents[0][2]).toEqual({ location: "header" });
  expect(JSON.stringify(phoneEvents)).not.toContain("16615182801");
});
