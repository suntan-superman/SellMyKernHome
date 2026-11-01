import { defineConfig, devices } from "@playwright/test";

const appPort = 3020;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "demo-access.spec.js",
  outputDir: "test-results/demo",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: { baseURL: `http://localhost:${appPort}`, trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: {
    command: `npx next dev --hostname 127.0.0.1 --port ${appPort}`,
    url: `http://localhost:${appPort}/demo-access`,
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      ...process.env,
      SMKH_ENVIRONMENT: "staging",
      SMKH_DEMO_MODE: "true",
      SMKH_ENABLE_STAGING_ANALYTICS: "false",
      SMKH_ENABLE_STAGING_EMAIL: "false",
      NEXT_PUBLIC_ROBOTS_INDEX: "false",
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "",
      DEMO_ACCESS_USERNAME: "isolated-reviewer",
      DEMO_ACCESS_PASSWORD: "isolated-demo-password",
      DEMO_SESSION_SECRET: "isolated-demo-session-secret-with-more-than-32-characters",
    },
  },
  projects: [{ name: "private-demo", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } }],
});
