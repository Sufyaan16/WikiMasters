import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stackServerApp } from "@/stack/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is an admin route
  if (pathname.startsWith("/admin")) {
    try {
      // Get the current user from StackAuth
      const user = await stackServerApp.getUser();

      // If no user is logged in, redirect to sign-in page
      if (!user) {
        const signInUrl = new URL("/handler/sign-in", request.url);
        signInUrl.searchParams.set("after_auth_return_to", pathname);
        return NextResponse.redirect(signInUrl);
      }

      // Check if user has admin role
      // Handle both string "admin" or object { role: "admin" }
      const isAdmin = 
        user.clientMetadata === "admin" || 
        user.clientMetadata?.role === "admin";

      if (!isAdmin) {
        // User is logged in but not admin - redirect to home with error
        const homeUrl = new URL("/", request.url);
        return NextResponse.redirect(homeUrl);
      }

      // User is admin - allow access
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware error:", error);
      // On error, redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
