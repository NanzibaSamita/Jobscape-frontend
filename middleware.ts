import { NextRequest, NextResponse } from "next/server";
import routes from "./data/protectedRoutes";
import { REDIRECT_URLS } from "./local/redirectDatas";

export function middleware(request: NextRequest) {
    const session = request.cookies.get("session");
    const { pathname } = request.nextUrl;

    // ✅ Updated: Check for 'role' instead of 'roleWeight'
    function isValidSession(sessionCookie: any): boolean {
        if (!sessionCookie?.value) return false;
        try {
            const parsed = JSON.parse(sessionCookie.value);
            // Check if session has required fields (use 'role' not 'roleWeight')
            return !!(parsed?.userId && parsed?.role);
        } catch {
            return false;
        }
    }

    const isProtectedRoute = routes.some((each) => pathname.startsWith(each.route));
    const access = routes.find((each) => each.route === pathname);

    // ✅ Only check auth if session is VALID
    if (isProtectedRoute && !isValidSession(session)) {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    if (access && !access.authOnly && isValidSession(session)) {
        // ✅ Use 'role' instead of 'roleWeight'
        const userRole = String(JSON.parse(session!.value).role) ?? '';
        if (!access.availableFor.includes(userRole)) {
            return NextResponse.redirect(new URL("/404", request.url));
        }
    }

    // ✅ Only redirect from /login if session is VALID
    if (pathname === "/login" && isValidSession(session)) {
        // ✅ Use 'role' instead of 'roleWeight'
        const userRole = String(JSON.parse(session!.value)?.role) ?? '';
        const dashboardUrl = new URL(REDIRECT_URLS[userRole] ?? "/dashboard", request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/jobs', '/login'],
};
