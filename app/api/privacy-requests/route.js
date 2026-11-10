import { NextResponse } from "next/server";
import { createPrivacyRequest } from "@/lib/privacy-requests";
import { createServiceClient } from "@/lib/supabase";
import { checkRateLimit, getRequestIp, verifyTurnstile } from "@/lib/rateLimit";
import { passesHoneypot, validatePrivacyRequest } from "@/lib/validation";
import { SITE_URL } from "@/lib/site";

function isAllowedOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const candidate = new URL(origin).origin;
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.replace(":", "");
    const requestOrigin = host ? `${protocol}://${host}` : new URL(request.url).origin;
    return candidate === requestOrigin || candidate === new URL(SITE_URL).origin;
  } catch {
    return false;
  }
}

export async function POST(request) {
  if (!isAllowedOrigin(request)) return NextResponse.json({ message: "Request origin was not accepted." }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 16 * 1024) return NextResponse.json({ message: "The request is too large." }, { status: 413 });
  const ip = getRequestIp(request);
  const client = createServiceClient();
  const rate = await checkRateLimit(client, `privacy:${ip}`, { limit: 3, windowSeconds: 3600 });
  if (!rate.allowed) return NextResponse.json({ message: "Too many privacy requests. Please wait before trying again." }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });
  try {
    const input = await request.json();
    const validation = validatePrivacyRequest(input);
    if (!validation.valid) return NextResponse.json({ message: "Review the highlighted information.", errors: validation.errors }, { status: 422 });
    if (!passesHoneypot(validation.data)) return NextResponse.json({ message: "The request could not be verified." }, { status: 400 });
    if (!(await verifyTurnstile(input.turnstileToken, ip))) return NextResponse.json({ message: "Please complete the anti-spam check." }, { status: 400 });
    const result = await createPrivacyRequest(validation.data);
    return NextResponse.json({ ok: true, reference: result.reference, duplicate: result.duplicate }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const setup = error.message?.includes("not configured");
    if (!setup) console.error("Privacy request failed", { message: error.message });
    return NextResponse.json({ message: setup ? "Privacy requests are still being configured." : "Your privacy request could not be saved. Please try again." }, { status: setup ? 503 : 500 });
  }
}
