import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = [
  "/cart",
  "/checkout",
  "/library",
  "/wishlist",
  "/orders",
  "/profile",
  "/admin",
];

export function middleware(request: NextRequest) {
  const isProtected = protectedPrefixes.some(
    (prefix) =>
      request.nextUrl.pathname === prefix || request.nextUrl.pathname.startsWith(`${prefix}/`),
  );
  if (!isProtected || request.cookies.has("playport_session")) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/cart/:path*",
    "/checkout/:path*",
    "/library/:path*",
    "/wishlist/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
