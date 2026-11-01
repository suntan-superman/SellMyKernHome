import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isDemoMode } from "./runtime";
import { DEMO_COOKIE_NAME, DEMO_SESSION_TTL_SECONDS, signDemoSession, verifyDemoSession } from "./demo-session-core";

const attempts = globalThis.__smkhDemoAccessAttempts || new Map();
globalThis.__smkhDemoAccessAttempts = attempts;

function sameValue(left, right) {
  const leftHash = createHash("sha256").update(String(left || "")).digest();
  const rightHash = createHash("sha256").update(String(right || "")).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export function getDemoAccessConfiguration() {
  const username = process.env.DEMO_ACCESS_USERNAME?.trim() || "";
  const password = process.env.DEMO_ACCESS_PASSWORD || "";
  const sessionSecret = process.env.DEMO_SESSION_SECRET || "";
  const errors = [];

  if (!isDemoMode()) errors.push("Private demo mode is not enabled for the staging environment.");
  if (!username) errors.push("DEMO_ACCESS_USERNAME is required.");
  if (password.length < 16) errors.push("DEMO_ACCESS_PASSWORD must contain at least 16 characters.");
  if (sessionSecret.length < 32) errors.push("DEMO_SESSION_SECRET must contain at least 32 characters.");
  if (process.env.NEXT_PUBLIC_ROBOTS_INDEX === "true") errors.push("Indexing must remain disabled for private staging.");

  return { configured: errors.length === 0, errors, username, password, sessionSecret };
}

export function getSafeDemoAccessStatus() {
  const configuration = getDemoAccessConfiguration();
  return { configured: configuration.configured, errors: configuration.errors };
}

export function verifyDemoCredentials(username, password) {
  const configuration = getDemoAccessConfiguration();
  if (!configuration.configured) return false;
  return sameValue(username, configuration.username) && sameValue(password, configuration.password);
}

export function checkDemoAccessRateLimit(identifier, { limit = 5, windowSeconds = 900 } = {}) {
  const configuration = getDemoAccessConfiguration();
  const hashSecret = configuration.sessionSecret || "unconfigured-demo-session";
  const key = createHash("sha256").update(`${hashSecret}:${identifier || "unknown"}`).digest("hex");
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, retryAfter: 0 };
  }
  current.count += 1;
  return { allowed: current.count <= limit, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
}

export function getDemoRequestIp(request) {
  return request.headers.get("x-nf-client-connection-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function isSameOriginRequest(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.replace(":", "");
    return new URL(origin).origin === `${protocol}://${host}`;
  } catch {
    return false;
  }
}

export function safeDemoDestination(value, fallback = "/demo") {
  const candidate = String(value || "");
  return candidate.startsWith("/") && !candidate.startsWith("//") && !candidate.includes("\\") ? candidate.slice(0, 500) : fallback;
}

export async function createDemoSessionToken() {
  const configuration = getDemoAccessConfiguration();
  if (!configuration.configured) throw new Error("Private demo access is not configured.");
  return signDemoSession(configuration.sessionSecret);
}

export async function verifyDemoSessionToken(token) {
  const configuration = getDemoAccessConfiguration();
  if (!configuration.configured) return false;
  return verifyDemoSession(token, configuration.sessionSecret);
}

export function demoCookieOptions(requestUrl) {
  const secure = process.env.NODE_ENV === "production" || new URL(requestUrl).protocol === "https:";
  return { httpOnly: true, secure, sameSite: "strict", path: "/", maxAge: DEMO_SESSION_TTL_SECONDS, priority: "high" };
}

export async function hasDemoAccess() {
  if (!isDemoMode()) return false;
  const token = (await cookies()).get(DEMO_COOKIE_NAME)?.value;
  return verifyDemoSessionToken(token);
}

export async function requireDemoAccess() {
  if (!(await hasDemoAccess())) redirect("/demo-access");
  return { authorized: true };
}
