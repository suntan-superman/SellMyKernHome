import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, adminCookieOptions, adminRequestOrigin, isSameOriginRequest } from "@/lib/admin-session";

export async function POST(request) {
  if (!isSameOriginRequest(request)) return new NextResponse("Request origin was not accepted.", { status: 403 });
  const response = NextResponse.redirect(new URL("/admin/login", adminRequestOrigin(request)), 303);
  response.cookies.set(ADMIN_COOKIE_NAME, "", { ...adminCookieOptions(request.url, 0), maxAge: 0 });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}
