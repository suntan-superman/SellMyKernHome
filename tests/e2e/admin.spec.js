import { test, expect } from "@playwright/test";

test("SMKH Admin requires authentication and records the verified operator", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel("Email address").fill("admin@example.test");
  await page.getByRole("textbox", { name: "Password" }).fill("synthetic-admin-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Seller leads" })).toBeVisible();
  await page.getByRole("link", { name: /Synthetic Seller/ }).click();
  await expect(page.getByRole("heading", { name: "Synthetic Seller" })).toBeVisible();
  await page.getByLabel("Status").selectOption("qualified");
  await page.getByLabel("Internal notes").fill("Verified synthetic admin update.");
  await page.getByRole("button", { name: "Save follow-up" }).click();
  await expect(page.getByText("Lead saved.")).toBeVisible();
  await expect(page.getByText("Qualified", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Attributed to admin/).first()).toBeVisible();
});

test("protected PI demonstration uses synthetic property data only", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill("admin@example.test");
  await page.getByRole("textbox", { name: "Password" }).fill("synthetic-admin-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.goto("/admin/property-intelligence");
  await expect(page.getByRole("heading", { name: "Synthetic Kern County property evaluation" })).toBeVisible();
  await expect(page.getByText("No PI API or automated transfer is represented.")).toBeVisible();
});
