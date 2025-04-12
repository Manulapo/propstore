import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// const protectedPaths = [
//   /\/shipping-address/,
//   /\/payment-method/,
//   /\/place-order/,
//   /\/profile-page/,
//   /\/user\/(.*)/,
//   /\/order\/(.*)/,
//   /\/admin/,
// ];

// export async function middleware(request: NextRequest) {
//   console.log("🧪 CUSTOM LOG TEST - middleware reached");

//   const token = await getToken({
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET,
//   });
//   const { pathname } = request.nextUrl;

//   console.log("MIDDLEWARE RUN:", pathname);
//   console.log("TOKEN:", token);
//   console.log("COOKIES IN REQUEST:", request.cookies.getAll());

//   const isProtected = protectedPaths.some((p) => p.test(pathname));

//   if (!token && isProtected) {
//     console.log("🚫 Utente non autenticato, redirect a /sign-in");
//     return NextResponse.redirect(new URL("/sign-in", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/shipping-address",
//     "/payment-method",
//     "/place-order",
//     "/profile-page",
//     "/user/:path*",
//     "/order/:path*",
//     "/admin/:path*",
//   ],
// };

export async function middleware(request: NextRequest) {
  console.log("🧪 MIDDLEWARE START");

  const allCookies = request.cookies.getAll();
  console.log("🍪 Cookies in request:", allCookies);

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log("🔑 Token:", token);

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/admin/:path*"],
};
