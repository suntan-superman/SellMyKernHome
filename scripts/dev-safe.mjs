import { spawn } from "node:child_process";
import path from "node:path";

const projectRoot = process.cwd();
const mockPort = "54321";
const appPort = "3000";
const sharedEnvironment = {
  ...process.env,
  NEXT_PUBLIC_SITE_URL: `http://127.0.0.1:${appPort}`,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
  TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
  NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${mockPort}`,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "isolated-local-publishable-key",
  SUPABASE_SECRET_KEY: "isolated-local-secret-key",
  RATE_LIMIT_HMAC_SECRET: "isolated-local-rate-limit-secret",
  RESEND_API_KEY: "",
  LEAD_NOTIFICATION_EMAIL: "",
  EMAIL_FROM: "",
  EMAIL_REPLY_TO: "",
  GNZ_ADMIN_BASE_URL: "",
};

const mock = spawn(process.execPath, [path.join(projectRoot, "tests", "fixtures", "mock-supabase.mjs")], {
  cwd: projectRoot,
  env: { ...sharedEnvironment, MOCK_SUPABASE_PORT: mockPort },
  stdio: "inherit",
});
const next = spawn(process.execPath, [path.join(projectRoot, "node_modules", "next", "dist", "bin", "next"), "dev", "--hostname", "127.0.0.1", "--port", appPort], {
  cwd: projectRoot,
  env: sharedEnvironment,
  stdio: "inherit",
});

let stopping = false;
function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  if (!mock.killed) mock.kill("SIGTERM");
  if (!next.killed) next.kill("SIGTERM");
  process.exitCode = exitCode;
}

for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => stop(0));
mock.on("exit", (code) => { if (!stopping) stop(code || 1); });
next.on("exit", (code) => { if (!stopping) stop(code || 1); });

process.stdout.write("Safe local mode: test Turnstile, in-memory lead storage, and email delivery disabled.\n");
