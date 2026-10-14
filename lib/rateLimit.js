import "server-only";
import { createHmac } from "node:crypto";

const buckets = globalThis.__smkhRateLimits || new Map();
globalThis.__smkhRateLimits = buckets;

export function getRequestIp(request) { return request.headers.get("x-nf-client-connection-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown"; }
export function hashIdentifier(value) { const secret = process.env.RATE_LIMIT_HMAC_SECRET || "local-development-only"; return createHmac("sha256", secret).update(String(value)).digest("hex"); }

function memoryLimit(key, limit, windowSeconds) {
  const now = Date.now(), current = buckets.get(key);
  if (!current || current.resetAt <= now) { buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 }); return { allowed: true, retryAfter: 0 }; }
  current.count += 1;
  return { allowed: current.count <= limit, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
}

export async function checkRateLimit(client, rawIdentifier, { limit = 5, windowSeconds = 900 } = {}) {
  const key = hashIdentifier(rawIdentifier);
  if (client) {
    const { data, error } = await client.rpc("smkh_check_rate_limit", { p_identifier_hash: key, p_request_limit: limit, p_window_seconds: windowSeconds });
    if (!error && data?.length) return { allowed: Boolean(data[0].allowed), retryAfter: Number(data[0].retry_after || 0) };
  }
  return memoryLimit(key, limit, windowSeconds);
}

export async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!token || typeof token !== "string" || token.length > 2048) return false;
  try {
    const body = new URLSearchParams({ secret, response: token }); if (ip && ip !== "unknown") body.set("remoteip", ip);
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body, cache: "no-store", signal: AbortSignal.timeout(6000) });
    if (!response.ok) return false;
    const result = await response.json(); return result?.success === true;
  } catch { return false; }
}

