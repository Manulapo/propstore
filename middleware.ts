import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedPaths = [
  /\/shipping-address/,
  /\/payment-method/,
  /\/place-order/,
  /\/profile-page/,
  /\/user\/(.*)/,
  /\/order\/(.*)/,
  /\/admin/,
]

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    const { pathname } = request.nextUrl
  
    console.log("MIDDLEWARE RUN:", pathname)
    console.log("TOKEN:", token)
  
    const isProtected = protectedPaths.some((p) => p.test(pathname))
  
    if (!token && isProtected) {
      console.log("🔒 Utente non autenticato, redirect a /sign-in")
      return NextResponse.redirect(new URL("/sign-in", request.url))
    }
  
    if (!request.cookies.get("sessionCartId")) {
      const sessionCartId = crypto.randomUUID()
      const response = NextResponse.next()
      response.cookies.set("sessionCartId", sessionCartId)
      return response
    }
  
    return NextResponse.next()
  }
  