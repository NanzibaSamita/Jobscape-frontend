import { NextRequest, NextResponse } from "next/server";
import routes from "./data/protectedRoutes";
import { REDIRECT_URLS } from "./local/redirectDatas";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session");
  const { pathname } = request.nextUrl;

  // ✅ Validate session function
  function isValidSession(sessionCookie: any): boolean {
    if (!sessionCookie?.value) return false;
    try {
      const parsed = JSON.parse(sessionCookie.value);
      return !!parsed?.userId && !!parsed?.role;
    } catch {
      return false;
    }
  }

  const isProtectedRoute = routes.some((each) => pathname.startsWith(each.route));
  const access = routes.find((each) => pathname.startsWith(each.route));

  // ✅ Check auth for protected routes
  if (isProtectedRoute && !isValidSession(session)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Check role-based access
  if (access && isValidSession(session)) {
    const userRole = String(JSON.parse(session!.value).role ?? "");

    // Only check if route has role restrictions AND is marked as auth-only
    if (access.authOnly && access.availableFor.length > 0) {
      if (!access.availableFor.includes(userRole)) {
        // Redirect to appropriate dashboard based on role
        const fallbackUrl = REDIRECT_URLS[userRole] ?? REDIRECT_URLS.DEFAULT ?? "/";
        return NextResponse.redirect(new URL(fallbackUrl, request.url));
      }
    }
  }

  // ✅ REMOVED: No redirect from /login if already logged in
  // Users should be able to access /login page anytime

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/employer/:path*", "/jobseeker/:path*", "/jobs"],
};
