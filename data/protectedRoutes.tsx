import { NextRequest, NextResponse } from "next/server";
import { REDIRECT_URLS } from "../local/redirectDatas";

/**
 * Protected route configuration
 */
export interface ProtectedRoute {
  route: string;
  authOnly: boolean;
  availableFor: string[];
}

const routes: ProtectedRoute[] = [
  {
    route: "/employer",
    authOnly: true,
    availableFor: ["EMPLOYER"],
  },
  {
    route: "/jobseeker",
    authOnly: true,
    availableFor: ["JOBSEEKER", "JOB_SEEKER"],
  },
  {
    route: "/admin",
    authOnly: true,
    availableFor: ["ADMIN"],
  },
  {
    route: "/jobs",
    authOnly: true,
    availableFor: ["JOBSEEKER", "JOB_SEEKER", "EMPLOYER"],
  },
  {
    route: "/dashboard",
    authOnly: true,
    availableFor: [],
  },
];

export default routes;

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session");
  const { pathname } = request.nextUrl;

  // ✅ Validate session
  function isValidSession(sessionCookie: any): boolean {
    if (!sessionCookie?.value) return false;
    try {
      const parsed = JSON.parse(sessionCookie.value);
      // Check if session has required fields (userId and role)
      return !!(parsed?.userId && parsed?.role);
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
    const userRole = String(JSON.parse(session!.value).role) ?? "";

    // Only check if route has role restrictions AND is marked as auth-only
    if (access.authOnly && access.availableFor.length > 0) {
      if (!access.availableFor.includes(userRole)) {
        // Redirect to appropriate dashboard based on role
        const fallbackUrl = REDIRECT_URLS[userRole] ?? REDIRECT_URLS.DEFAULT ?? "/";
        return NextResponse.redirect(new URL(fallbackUrl, request.url));
      }
    }
  }

  // ✅ Redirect from /login if already logged in
  if (pathname === "/login" && isValidSession(session)) {
    const userRole = String(JSON.parse(session!.value)?.role) ?? "";
    const dashboardUrl = new URL(REDIRECT_URLS[userRole] ?? REDIRECT_URLS.DEFAULT ?? "/", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/employer/:path*",
    "/jobseeker/:path*",
    "/jobs",
    "/login",
  ],
};
