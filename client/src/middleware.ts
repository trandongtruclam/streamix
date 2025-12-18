import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/sign-in",
  "/sign-up",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/me",
  "/api/webhooks",
  "/api/uploadthing",
  "/search",
];

const isPublicRoute = (pathname: string) => {
  // Check exact matches
  if (publicRoutes.includes(pathname)) {
    return true;
  }

  // Check if it's a user profile page (/:username)
  if (pathname.match(/^\/[a-zA-Z0-9_]+$/) && !pathname.startsWith("/u/")) {
    return true;
  }

  // Check if it's an API route that should be public
  if (pathname.startsWith("/api/webhooks") || pathname.startsWith("/api/uploadthing")) {
    return true;
  }

  return false;
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get("streamix_session")?.value;

  // If trying to access auth pages while logged in, redirect to home
  if (sessionToken && (pathname === "/sign-in" || pathname === "/sign-up")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If trying to access protected route without session, redirect to sign-in
  if (!sessionToken && !isPublicRoute(pathname)) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)$).*)",
  ],
};
