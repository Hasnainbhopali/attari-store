import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;

  // Protect /checkout: requires authenticated user (CUSTOMER or OWNER)
  if (pathname.startsWith("/checkout")) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/api/auth/signin", req.nextUrl.origin);
      signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Protect all owner and admin routes: requires OWNER role
  if (pathname.startsWith("/owner") || pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/api/auth/signin", req.nextUrl.origin);
      signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
    if (role !== "OWNER") {
      // Authenticated but unauthorized (CUSTOMER attempting to access OWNER routes)
      return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: [
    "/checkout/:path*",
    "/owner/:path*",
    "/admin/:path*",
  ],
};
