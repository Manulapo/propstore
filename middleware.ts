import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = [
  /\/shipping-address/,
  /\/payment-method/,
  /\/place-order/,
  /\/profile-page/,
  /\/user\/(.*)/,
  /\/order\/(.*)/,
  /\/admin/,
];

export async function middleware(request: NextRequest) {
  const cookieName =
    process.env.NODE_ENV === "production"
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName,
  });

  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((p) => p.test(pathname));

  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const response = NextResponse.next();

  if (!request.cookies.get("sessionCartId")) {
    const sessionCartId = crypto.randomUUID();
    response.cookies.set("sessionCartId", sessionCartId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/shipping-address",
    "/payment-method",
    "/place-order",
    "/profile-page",
    "/user/:path*",
    "/order/:path*",
    "/admin/:path*",
  ],
};
