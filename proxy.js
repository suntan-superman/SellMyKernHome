import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "./lib/admin-shared";

const publicAdminPaths = new Set(["/admin/login", "/api/admin/login"]);

function privateResponse(response) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export function proxy(request) {
  const pathname = request.nextUrl.pathname;
  const adminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const adminApi = pathname.startsWith("/api/admin/");
  if (!adminPath && !adminApi) return NextResponse.next();
  if (publicAdminPaths.has(pathname)) return privateResponse(NextResponse.next());

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (token) return privateResponse(NextResponse.next());
  if (adminApi) return privateResponse(NextResponse.json({ message: "Admin authentication is required." }, { status: 401 }));

  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  return privateResponse(NextResponse.redirect(login));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
