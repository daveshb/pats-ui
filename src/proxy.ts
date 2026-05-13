import { NextRequest, NextResponse } from "next/server";

// Routes that are always public (no auth required)
const PUBLIC_PATHS = ["/", "/dashboard", "/signup", "/forgot-password", "/reset-password", "/migrate"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  const hasSession = request.cookies.get("vantage_auth")?.value === "1";

  // Unauthenticated user trying to reach a protected route → login
  if (!isPublic && !hasSession) {
    const loginUrl = new URL("/", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user hitting login → dashboard
  if (isPublic && pathname === "/" && hasSession) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
