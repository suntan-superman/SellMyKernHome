import { defineConfig, devices } from "@playwright/test";

const testMode = process.env.TURNSTILE_TEST_MODE || "pass";
const modeConfig = {
  pass: { appPort: 3010, mockPort: 54321, secret: "1x0000000000000000000000000000000AA" },
  spent: { appPort: 3011, mockPort: 54322, secret: "3x0000000000000000000000000000000AA" },
  fail: { appPort: 3012, mockPort: 54323, secret: "2x0000000000000000000000000000000AA" },
};
const selectedMode = modeConfig[testMode];

if (!selectedMode) {
  throw new Error(`Unsupported TURNSTILE_TEST_MODE: ${testMode}`);
}

const { appPort, mockPort, secret } = selectedMode;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "turnstile.spec.js",
  outputDir: "test-results/turnstile",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL: `http://127.0.0.1:${appPort}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "node tests/fixtures/mock-supabase.mjs",
      url: `http://127.0.0.1:${mockPort}/state`,
      reuseExistingServer: false,
      timeout: 30000,
      env: { ...process.env, MOCK_SUPABASE_PORT: String(mockPort) },
    },
    {
      command: `npx next dev --hostname 127.0.0.1 --port ${appPort}`,
      url: `http://127.0.0.1:${appPort}`,
      reuseExistingServer: false,
      timeout: 120000,
      env: {
        ...process.env,
        NEXT_PUBLIC_SITE_URL: `http://127.0.0.1:${appPort}`,
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
        TURNSTILE_SECRET_KEY: secret,
        NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${mockPort}`,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "isolated-test-publishable-key",
        SUPABASE_SECRET_KEY: "isolated-test-secret-key",
        RATE_LIMIT_HMAC_SECRET: "isolated-test-rate-limit-secret",
        RESEND_API_KEY: "",
        LEAD_NOTIFICATION_EMAIL: "",
        EMAIL_FROM: "",
      },
    },
  ],
  projects: testMode !== "pass"
    ? [{ name: `${testMode}-token`, use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } }]
    : [
        { name: "mobile-390", use: { ...devices["iPhone 13"], browserName: "chromium", viewport: { width: 390, height: 844 } } },
        { name: "desktop-1280", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } },
      ],
});
