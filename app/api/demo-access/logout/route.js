import { NextResponse } from "next/server";
import { DEMO_COOKIE_NAME } from "@/lib/demo-session-core";
import { demoCookieOptions, getDemoAccessConfiguration, isSameOriginRequest } from "@/lib/demo-access";

export async function POST(request) {
  const configuration = getDemoAccessConfiguration();
  if (!configuration.configured) return new NextResponse("Private staging access is not configured.", { status: 503 });
  if (!isSameOriginRequest(request)) return new NextResponse("Request origin was not accepted.", { status: 403 });
  const response = NextResponse.redirect(new URL("/demo-access", request.url), 303);
  response.cookies.set(DEMO_COOKIE_NAME, "", { ...demoCookieOptions(request.url), maxAge: 0 });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}
