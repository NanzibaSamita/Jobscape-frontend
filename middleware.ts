import { NextRequest, NextResponse } from "next/server";
import routes from "./data/protectedRoutes";
import { REDIRECT_URLS } from "./local/redirectDatas";

const PUBLIC = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

// ✅ normalize role formats: "JOB_SEEKER", "job_seeker", "job-seeker" → "job-seeker"
const normalizeRole = (role: unknown) => {
  const r = String(role ?? "")
    .trim()
    .toLowerCase();

  if (["job_seeker", "job-seeker", "jobseeker", "job seeker"].includes(r)) {
    return "job-seeker";
  }
  if (["hiring", "recruiter", "employer"].includes(r)) {
    return "hiring";
  }
  if (!r) return "base";

  return r; // fallback: keep whatever it is but lowercased
};

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session");
  const { pathname } = request.nextUrl;

  // ✅ Always allow public routes
  if (PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // ✅ No session + protected route => go login
  const isProtectedRoute = routes.some((each) =>
    pathname.startsWith(each.route),
  );
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ✅ Read role safely once
  let userRole = "base";
  if (session) {
    try {
      const parsed = JSON.parse(session.value);
      userRole = normalizeRole(parsed?.roleWeight);
    } catch {
      // malformed cookie => treat as logged out
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 1) If logged in and hitting login, go to dashboard/role home
  if (session && pathname === "/login") {
    const redirectPath =
      REDIRECT_URLS[userRole] || REDIRECT_URLS["base"] || "/";

    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // 2) Role-based access control (use startsWith, and normalize availableFor too)
  const access = routes.find((each) => pathname.startsWith(each.route));
  if (access && session) {
    const allowed = (access.availableFor || []).map(normalizeRole);

    if (!allowed.includes(userRole)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // ✅ exclude static + api + images folder
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
