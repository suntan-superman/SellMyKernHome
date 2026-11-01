import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  adminRequestOrigin,
  adminCookieOptions,
  checkAdminLoginRateLimit,
  getAdminRequestIp,
  isSameOriginRequest,
  resetAdminLoginRateLimit,
  safeAdminDestination,
} from "@/lib/admin-session";
import { createAuthenticatedClient, createPublicAuthClient } from "@/lib/supabase";

function loginRedirect(request, error, destination) {
  const url = new URL("/admin/login", adminRequestOrigin(request));
  url.searchParams.set("error", error);
  url.searchParams.set("next", safeAdminDestination(destination));
  return NextResponse.redirect(url, 303);
}

export async function POST(request) {
  if (!isSameOriginRequest(request)) return new NextResponse("Request origin was not accepted.", { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 8 * 1024) return new NextResponse("The request is too large.", { status: 413 });
  const requestIp = getAdminRequestIp(request);
  const rate = checkAdminLoginRateLimit(requestIp);
  if (!rate.allowed) return new NextResponse("Too many sign-in attempts. Try again later.", { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });

  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase().slice(0, 254);
  const password = String(form.get("password") || "").slice(0, 500);
  const destination = safeAdminDestination(form.get("next"));
  const authClient = createPublicAuthClient();
  if (!authClient) return new NextResponse("Admin authentication is not configured.", { status: 503 });
  const { data, error } = await authClient.auth.signInWithPassword({ email, password });
  if (error || !data.session?.access_token || !data.user?.id) return loginRedirect(request, "invalid", destination);

  const dataClient = createAuthenticatedClient(data.session.access_token);
  if (!dataClient) return new NextResponse("Admin data access is not configured.", { status: 503 });
  const { data: membership, error: membershipError } = await dataClient
    .from("smkh_admin_memberships")
    .select("user_id,active")
    .eq("user_id", data.user.id)
    .eq("active", true)
    .maybeSingle();
  if (membershipError || !membership) return loginRedirect(request, "unauthorized", destination);

  resetAdminLoginRateLimit(requestIp);
  const response = NextResponse.redirect(new URL(destination, adminRequestOrigin(request)), 303);
  response.cookies.set(ADMIN_COOKIE_NAME, data.session.access_token, adminCookieOptions(request.url, data.session.expires_in));
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}
