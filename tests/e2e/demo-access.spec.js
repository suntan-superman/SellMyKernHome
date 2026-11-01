import { test, expect } from "@playwright/test";

test("private staging requires authentication and remains noindex with analytics disabled", async ({ page, request }) => {
  const anonymousApi = await request.post("/api/leads", { data: {} });
  expect(anonymousApi.status()).toBe(401);

  const response = await page.goto("/");
  await expect(page).toHaveURL(/\/demo-access\?next=/);
  expect(response.headers()["x-robots-tag"]).toContain("noindex");
  await expect(page.getByRole("heading", { name: "Sell My Kern Home demonstration" })).toBeVisible();

  await page.getByLabel("Review username").fill("isolated-reviewer");
  await page.getByLabel("Review password").fill("incorrect-password");
  await page.getByRole("button", { name: "Open private preview" }).click();
  await expect(page.getByRole("alert")).toContainText("not accepted");

  await page.getByLabel("Review username").fill("isolated-reviewer");
  await page.getByLabel("Review password").fill("isolated-demo-password");
  await page.getByRole("button", { name: "Open private preview" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Thinking About Selling");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
  const demoCookie = (await page.context().cookies()).find((cookie) => cookie.name === "smkh_demo_session");
  expect({ domain: demoCookie?.domain, path: demoCookie?.path, httpOnly: demoCookie?.httpOnly, secure: demoCookie?.secure, sameSite: demoCookie?.sameSite }).toEqual({ domain: new URL(page.url()).hostname, path: "/", httpOnly: true, secure: false, sameSite: "Strict" });
  await page.goto("/demo");
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByRole("heading", { name: "Sell My Kern Home partnership demonstration" })).toBeVisible();
  await expect(page.getByText("Workside-controlled private staging", { exact: false })).toBeVisible();

  await page.getByRole("link", { name: /Open the PI scenario/ }).click();
  await expect(page.getByRole("heading", { name: "Synthetic Kern County property evaluation" })).toBeVisible();
  await expect(page.getByText("casey@example.test")).toHaveCount(0);
  await expect(page.getByText("1000 Example Avenue", { exact: false })).toBeVisible();

  const robots = await (await page.request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /");
  expect(robots).not.toContain("Sitemap:");
});
