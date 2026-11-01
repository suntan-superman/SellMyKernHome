import { NextResponse } from "next/server";
import { DEMO_COOKIE_NAME } from "./lib/demo-session-core";
import { getDemoAccessConfiguration, verifyDemoSessionToken } from "./lib/demo-access";

const openDemoPaths = new Set([
  "/demo-access",
  "/api/demo-access/login",
  "/api/demo-access/logout",
  "/robots.txt",
]);

function protectedResponse(response) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export async function proxy(request) {
  if (process.env.SMKH_DEMO_MODE !== "true") return NextResponse.next();

  const configuration = getDemoAccessConfiguration();
  if (!configuration.configured) {
    return protectedResponse(new NextResponse("Private staging access is not configured.", { status: 503 }));
  }

  const pathname = request.nextUrl.pathname;
  if (openDemoPaths.has(pathname)) return protectedResponse(NextResponse.next());

  const token = request.cookies.get(DEMO_COOKIE_NAME)?.value;
  if (await verifyDemoSessionToken(token)) return protectedResponse(NextResponse.next());

  if (pathname.startsWith("/api/")) {
    return protectedResponse(NextResponse.json({ message: "Private staging authentication is required." }, { status: 401 }));
  }

  const login = new URL("/demo-access", request.url);
  login.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  return protectedResponse(NextResponse.redirect(login));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|images/|icon.svg|favicon.ico).*)"],
};
