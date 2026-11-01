import { NextResponse } from "next/server";
import { DEMO_COOKIE_NAME } from "@/lib/demo-session-core";
import {
  checkDemoAccessRateLimit,
  createDemoSessionToken,
  demoCookieOptions,
  getDemoAccessConfiguration,
  getDemoRequestIp,
  isSameOriginRequest,
  safeDemoDestination,
  verifyDemoCredentials,
} from "@/lib/demo-access";

function redirectWithError(request, code, destination = "/demo") {
  const url = new URL("/demo-access", request.url);
  url.searchParams.set("error", code);
  url.searchParams.set("next", safeDemoDestination(destination));
  return NextResponse.redirect(url, 303);
}

export async function POST(request) {
  const configuration = getDemoAccessConfiguration();
  if (!configuration.configured) return new NextResponse("Private staging access is not configured.", { status: 503 });
  if (!isSameOriginRequest(request)) return new NextResponse("Request origin was not accepted.", { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 8 * 1024) return new NextResponse("The request is too large.", { status: 413 });

  const rate = checkDemoAccessRateLimit(getDemoRequestIp(request));
  if (!rate.allowed) {
    return new NextResponse("Too many access attempts. Try again later.", { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });
  }

  const form = await request.formData();
  const username = String(form.get("username") || "").slice(0, 100);
  const password = String(form.get("password") || "").slice(0, 500);
  const destination = safeDemoDestination(form.get("next"));
  if (!verifyDemoCredentials(username, password)) return redirectWithError(request, "invalid", destination);

  const response = NextResponse.redirect(new URL(destination, request.url), 303);
  response.cookies.set(DEMO_COOKIE_NAME, await createDemoSessionToken(), demoCookieOptions(request.url));
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}
