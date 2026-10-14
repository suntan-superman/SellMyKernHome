import { spawnSync } from "node:child_process";
import path from "node:path";

const playwrightCli = path.join(process.cwd(), "node_modules", "@playwright", "test", "cli.js");

for (const mode of ["pass", "fail", "spent"]) {
  const result = spawnSync(process.execPath, [playwrightCli, "test", "--config=playwright.turnstile.config.js"], {
    cwd: process.cwd(),
    env: { ...process.env, TURNSTILE_TEST_MODE: mode },
    stdio: "inherit",
  });

  if (result.status !== 0) process.exit(result.status || 1);
}
