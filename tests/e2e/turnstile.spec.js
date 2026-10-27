import { test, expect } from "@playwright/test";

const testMode = process.env.TURNSTILE_TEST_MODE || "pass";
const mockPorts = { pass: 54321, spent: 54322, fail: 54323 };
const mockPort = mockPorts[testMode];
const mockBase = `http://127.0.0.1:${mockPort}`;

function payload(overrides = {}) {
  return {
    submissionToken: crypto.randomUUID(),
    propertyAddress: "123 Isolated Test Street",
    propertyCity: "Bakersfield",
    propertyZip: "93301",
    name: "Turnstile Test",
    preferredContact: "email",
    email: "turnstile@example.invalid",
    phone: "",
    privacyAcknowledged: true,
    marketingConsent: false,
    propertyType: "Single-family home",
    condition: "Unsure",
    occupancy: "Vacant",
    timing: "Exploring options",
    comments: "Isolated Turnstile verification only.",
    website: "",
    startedAt: Date.now() - 5000,
    consentVersion: "turnstile-test-v1",
    landingUrl: "http://127.0.0.1/turnstile-test",
    referrer: "",
    utmSource: "verification",
    utmMedium: "automated-test",
    utmCampaign: "turnstile",
    utmContent: "",
    utmTerm: "",
    ...overrides,
  };
}

async function reset(request) {
  await request.post(`${mockBase}/reset`);
}

async function state(request) {
  return (await request.get(`${mockBase}/state`)).json();
}

test.beforeEach(async ({ request }) => reset(request));

test("spent or expired token is rejected without side effects", async ({ request }) => {
  test.skip(testMode !== "spent", "Runs with Cloudflare's official timeout-or-duplicate test secret.");
  const response = await request.post("/api/leads", { data: payload({ turnstileToken: "XXXX.DUMMY.TOKEN.XXXX" }) });
  expect(response.status()).toBe(400);
  expect((await response.json()).message).toBe("Please complete the anti-spam check.");
  const result = await state(request);
  expect(result.leads).toHaveLength(0);
  expect(result.notifications).toHaveLength(0);
});

test("missing token cannot create a lead or notification", async ({ request }) => {
  test.skip(testMode !== "pass", "Pass-mode verification.");
  const response = await request.post("/api/leads", { data: payload({ turnstileToken: "" }) });
  expect(response.status()).toBe(400);
  expect((await response.json()).message).toBe("Please complete the anti-spam check.");
  const result = await state(request);
  expect(result.leads).toHaveLength(0);
  expect(result.notifications).toHaveLength(0);
});

test("invalid token cannot create a lead or notification", async ({ request }) => {
  test.skip(testMode !== "fail", "Runs with Cloudflare's official always-fail test secret.");
  const response = await request.post("/api/leads", { data: payload({ turnstileToken: "XXXX.DUMMY.TOKEN.XXXX" }) });
  expect(response.status()).toBe(400);
  expect((await response.json()).message).toBe("Please complete the anti-spam check.");
  const result = await state(request);
  expect(result.leads).toHaveLength(0);
  expect(result.notifications).toHaveLength(0);
});

test("rate limiting remains active before lead creation", async ({ request }) => {
  test.skip(testMode !== "pass", "Pass-mode verification.");
  const statuses = [];
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await request.post("/api/leads", { data: payload({ turnstileToken: "" }) });
    statuses.push(response.status());
  }
  expect(statuses).toEqual([400, 400, 400, 400, 400, 429]);
  const result = await state(request);
  expect(result.rateCalls).toBe(6);
  expect(result.leads).toHaveLength(0);
  expect(result.notifications).toHaveLength(0);
});

test("widget renders and a successful form creates the correctly attributed lead", async ({ page, request }) => {
  test.skip(testMode !== "pass", "Pass-mode verification.");
  const analyticsEvents = [];
  await page.exposeFunction("captureAnalyticsEvent", (...args) => analyticsEvents.push(args));
  await page.addInitScript(() => { window.gtag = (...args) => window.captureAnalyticsEvent(...args); });
  await page.goto("/?utm_source=turnstile-test&utm_medium=playwright");
  await page.getByLabel("Property street address").fill("123 Isolated Test Street");
  await page.getByLabel("City").fill("Bakersfield");
  await page.getByLabel("ZIP code").fill("93301");
  await page.getByLabel("Your name").fill("Turnstile Test");
  await page.getByLabel("Email address").fill("turnstile@example.invalid");
  await page.getByRole("checkbox", { name: /I understand GNZ Marketing/ }).check();
  await page.waitForTimeout(1600);
  await page.getByRole("button", { name: "Continue" }).click();
  const widget = page.getByRole("group", { name: "Anti-spam verification" });
  await expect(widget).toBeVisible();
  await expect.poll(
    () => page.frames().some((frame) => frame.url().includes("challenges.cloudflare.com")),
    { timeout: 15000 },
  ).toBe(true);
  await expect.poll(
    () => page.frames().some((frame) => frame.url().includes("1x00000000000000000000AA")),
    { timeout: 15000 },
  ).toBe(true);
  const submitButton = page.getByRole("button", { name: "Send My Inquiry" });
  await expect(submitButton).toBeEnabled({ timeout: 15000 });
  await submitButton.click();
  await expect(page).toHaveURL(/\/thank-you$/i, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: /Thank you/ })).toBeVisible();
  expect(analyticsEvents.some((event) => event[0] === "event" && event[1] === "seller_form_start")).toBe(true);
  expect(analyticsEvents.filter((event) => event[0] === "event" && event[1] === "seller_form_submit_success")).toHaveLength(1);

  const result = await state(request);
  expect(result.leads).toHaveLength(1);
  expect(result.leads[0]).toMatchObject({
    source: "seller_web",
    lead_type: "seller",
    source_site: "sellmykernhome.com",
    service: "seller-property",
  });
  expect(result.leads[0].attribution).toMatchObject({ utm_source: "turnstile-test", utm_medium: "playwright" });
  expect(result.notifications).toHaveLength(1);
  expect(result.events.indexOf("lead_insert")).toBeLessThan(result.events.indexOf("notification_log"));
});

test("form shows the server error and keeps the widget available for retry", async ({ page }) => {
  test.skip(testMode !== "pass", "Pass-mode verification.");
  await page.route("**/api/leads", (route) => route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ message: "Please complete the anti-spam check." }) }));
  await page.goto("/");
  await page.getByLabel("Property street address").fill("123 Isolated Test Street");
  await page.getByLabel("City").fill("Bakersfield");
  await page.getByLabel("ZIP code").fill("93301");
  await page.getByLabel("Your name").fill("Turnstile Test");
  await page.getByLabel("Email address").fill("turnstile@example.invalid");
  await page.getByRole("checkbox", { name: /I understand GNZ Marketing/ }).check();
  await page.waitForTimeout(1600);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("group", { name: "Anti-spam verification" })).toBeVisible();
  const submitButton = page.getByRole("button", { name: "Send My Inquiry" });
  await expect(submitButton).toBeEnabled({ timeout: 15000 });
  await submitButton.click();
  await expect(page.locator(".form-alert")).toHaveText("Please complete the anti-spam check.");
  await expect(page.getByRole("group", { name: "Anti-spam verification" })).toBeVisible();
});
