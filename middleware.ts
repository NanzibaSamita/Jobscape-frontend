import { NextRequest, NextResponse } from "next/server";
import routes from "./data/protectedRoutes";
import { REDIRECT_URLS } from "./local/redirectDatas";



export function middleware(request: NextRequest) {
    // Get the session cookie
    const session = request.cookies.get("session")
    const { pathname } = request.nextUrl

    // Check if the current route is protected
    const isProtectedRoute = routes.some((each) => pathname.startsWith(each.route));
    const access = routes.find((each) => each.route === pathname);

    // If accessing a protected route without a session, redirect to login
    // console.log({ session, isProtectedRoute, pathname })
    if (isProtectedRoute && !session) {
        const loginUrl = new URL("/login", request.url)
        return NextResponse.redirect(loginUrl)
    }

    if (access && !access.authOnly) {
        const userRole = String(JSON.parse(session?.value ?? "").roleWeight) ?? '';
        if (!access.availableFor.includes(userRole)) return NextResponse.redirect(new URL("/404", request.url));
    }

    // If logged in and trying to access login page, redirect to dashboard
    if (session && pathname === "/login") {
        const userRole = String(JSON.parse(session?.value ?? "")?.roleWeight) ?? '';
        const dashboardUrl = new URL(REDIRECT_URLS[userRole] ?? "/dashboard", request.url);
        return NextResponse.redirect(dashboardUrl)
    }

    // Allow the request to continue
    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/jobs', '/login'],
};