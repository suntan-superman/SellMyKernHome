import { test, expect } from "@playwright/test";

const measurementId = "G-TEST123456";

async function dataLayerEntries(page) {
  return page.evaluate(() => (window.dataLayer || []).map((entry) => Array.from(entry)));
}

test("analytics waits for consent, sends one explicit page view, and supports withdrawal", async ({ page }) => {
  let tagRequests = 0;
  await page.route("https://www.googletagmanager.com/gtag/js**", async (route) => {
    tagRequests += 1;
    await route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
  });

  await page.goto("/");
  await expect(page.getByRole("complementary", { name: "Analytics privacy choices" })).toBeVisible();
  expect(tagRequests).toBe(0);

  let entries = await dataLayerEntries(page);
  expect(entries.some(([command, action, params]) => command === "consent" && action === "default" && params.analytics_storage === "denied")).toBeTruthy();
  expect(entries.filter(([command, event]) => command === "event" && event === "page_view")).toHaveLength(0);

  await page.getByRole("button", { name: "Decline" }).click();
  expect(tagRequests).toBe(0);
  await expect.poll(() => page.evaluate((id) => window[`ga-disable-${id}`], measurementId)).toBe(true);

  await page.getByRole("button", { name: "Review analytics privacy choices" }).click();
  await page.getByRole("button", { name: "Allow analytics" }).click();
  await expect.poll(() => tagRequests).toBe(1);
  await expect.poll(async () => {
    const current = await dataLayerEntries(page);
    return current.filter(([command, event]) => command === "event" && event === "page_view").length;
  }).toBe(1);

  entries = await dataLayerEntries(page);
  expect(entries.some(([command, id, config]) => command === "config" && id === measurementId && config.send_page_view === false)).toBeTruthy();
  const firstPageView = entries.find(([command, event]) => command === "event" && event === "page_view");
  expect(firstPageView[2].page_path).toBe("/");
  expect(firstPageView[2].page_location).toBe("http://127.0.0.1:3000/");
  expect(firstPageView[2].page_location).not.toContain("?");

  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "How It Works" }).click();
  await expect(page).toHaveURL(/\/how-it-works$/);
  await expect.poll(async () => {
    const current = await dataLayerEntries(page);
    return current.filter(([command, event]) => command === "event" && event === "page_view").length;
  }).toBe(2);

  await page.locator('[data-analytics-event="primary_cta_click"][data-analytics-location="section_cta"]').click();
  await expect(page).toHaveURL(/\/#property-form$/);

  await page.evaluate(() => {
    const phone = document.createElement("a");
    phone.href = "tel:+16615550123";
    phone.textContent = "Call";
    document.body.appendChild(phone);
    phone.click();
    phone.remove();

    const email = document.createElement("a");
    email.href = "mailto:seller@example.test";
    email.textContent = "Email";
    document.body.appendChild(email);
    email.click();
    email.remove();
  });
  entries = await dataLayerEntries(page);
  const clickEvents = entries.filter(([command, event]) => command === "event" && ["primary_cta_click", "phone_click", "email_click"].includes(event));
  expect(clickEvents.map(([, event]) => event)).toEqual(["primary_cta_click", "phone_click", "email_click"]);
  expect(clickEvents[0][2]).toEqual({ location: "section_cta", destination: "/#property-form" });
  expect(JSON.stringify(clickEvents)).not.toContain("16615550123");
  expect(JSON.stringify(clickEvents)).not.toContain("seller@example.test");

  await page.context().addCookies([
    { name: "_ga", value: "GA1.1.synthetic", domain: "127.0.0.1", path: "/" },
    { name: "_ga_TEST123456", value: "synthetic", domain: "127.0.0.1", path: "/" },
  ]);
  await page.getByRole("button", { name: "Review analytics privacy choices" }).click();
  await expect.poll(() => page.evaluate((id) => window[`ga-disable-${id}`], measurementId)).toBe(true);
  expect(await page.evaluate(() => window.localStorage.getItem("smkh_analytics_consent"))).toBe("denied");
  expect((await page.context().cookies()).filter(({ name }) => name.startsWith("_ga"))).toHaveLength(0);
});

test("admin routes never initialize analytics even with stored consent", async ({ page }) => {
  let tagRequests = 0;
  await page.route("https://www.googletagmanager.com/gtag/js**", async (route) => {
    tagRequests += 1;
    await route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
  });
  await page.addInitScript(() => window.localStorage.setItem("smkh_analytics_consent", "granted"));
  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { name: "Authorized access" })).toBeVisible();
  expect(tagRequests).toBe(0);
  expect((await dataLayerEntries(page)).filter(([command, event]) => command === "event" && event === "page_view")).toHaveLength(0);
  await expect(page.getByRole("button", { name: "Review analytics privacy choices" })).toHaveCount(0);
});

test("private and post-submission routes return explicit noindex headers", async ({ request }) => {
  for (const route of ["/admin/login", "/api/leads", "/thank-you"]) {
    const response = await request.get(route);
    expect(response.headers()["x-robots-tag"], route).toBe("noindex, nofollow, noarchive");
  }
});
