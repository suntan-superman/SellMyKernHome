import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthenticatedClient, createPublicAuthClient } from "./supabase";
import { ADMIN_COOKIE_NAME } from "./admin-shared";

export { ADMIN_COOKIE_NAME } from "./admin-shared";
const attempts = globalThis.__smkhAdminLoginAttempts || new Map();
globalThis.__smkhAdminLoginAttempts = attempts;

export function adminCookieOptions(requestUrl, maxAge = 3300) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" || new URL(requestUrl).protocol === "https:",
    sameSite: "strict",
    path: "/",
    maxAge: Math.max(0, Math.min(Number(maxAge) || 0, 3600)),
    priority: "high",
  };
}

export function isSameOriginRequest(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === adminRequestOrigin(request);
  } catch {
    return false;
  }
}

export function adminRequestOrigin(request) {
  const fallback = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || fallback.host;
  const protocol = request.headers.get("x-forwarded-proto") || fallback.protocol.replace(":", "");
  return `${protocol}://${host}`;
}

export function safeAdminDestination(value, fallback = "/admin") {
  const candidate = String(value || "");
  return candidate.startsWith("/admin") && !candidate.startsWith("//") && !candidate.includes("\\")
    ? candidate.slice(0, 500)
    : fallback;
}

export function getAdminRequestIp(request) {
  return request.headers.get("x-nf-client-connection-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function checkAdminLoginRateLimit(identifier, { limit = 5, windowSeconds = 900 } = {}) {
  const key = createHash("sha256").update(String(identifier || "unknown")).digest("hex");
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, retryAfter: 0 };
  }
  current.count += 1;
  return { allowed: current.count <= limit, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
}

export function resetAdminLoginRateLimit(identifier) {
  const key = createHash("sha256").update(String(identifier || "unknown")).digest("hex");
  attempts.delete(key);
}

export async function getAdminContext() {
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  const authClient = createPublicAuthClient();
  const dataClient = createAuthenticatedClient(token);
  if (!authClient || !dataClient) return null;

  const { data: userResult, error: userError } = await authClient.auth.getUser(token);
  const userId = userResult?.user?.id;
  if (userError || !userId) return null;

  const { data: membership, error: membershipError } = await dataClient
    .from("smkh_admin_memberships")
    .select("user_id,display_name,role,active")
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();
  if (membershipError || !membership) return null;

  return {
    userId,
    displayName: membership.display_name,
    role: membership.role,
    client: dataClient,
  };
}

export async function requireAdmin(roles = ["owner", "admin", "operator", "viewer"]) {
  const context = await getAdminContext();
  if (!context) redirect("/admin/login");
  if (!roles.includes(context.role)) redirect("/admin?error=forbidden");
  return context;
}
