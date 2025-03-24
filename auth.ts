/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { NextAuthConfig } from "next-auth";
import { prisma } from "@/db/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const config = {
  pages: {
    signIn: "/sign-in", // This is the page that the user will be redirected to when they are not signed in.
    error: "/sign-in", // This is the page that the user will be redirected to when there is an error.
  },
  session: {
    strategy: "jwt", // This is the strategy that is used to authenticate the user meaning that the user will be authenticated using a JSON Web Token.
    maxAge: 30 * 24 * 60 * 60, // This is the maximum age of the session i.e. the session will expire after 30 days.
  },
  adapter: PrismaAdapter(prisma), // An adapter is a piece of code that is used to connect to the database.
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Find user by email only
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
          },
        });

        // If no user or no password, return null
        if (!user || !user.password) return null;

        // Compare hashed password
        const isValidPassword = compareSync(
          credentials.password as string,
          user.password
        );
        if (!isValidPassword) return null;

        // Return user data (excluding password)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user, trigger, token }: any) {
      // This is a callback that is used to create the session. It is called when the user is authenticated. It is also called when the user is updated.
      if (!token) {
        console.error("Token is undefined in session callback");
        return session;
      }

      // Set user ID from the token
      session.user.id = token.sub; // the sub is the user id that is stored in the token
      session.user.role = token.role;
      session.user.name = token.name;

      // If there is an update, set the user name (our app allows to change name)
      if (trigger === "update") {
        session.user.name = user.name;
      }

      return session;
    },
    async jwt({ token, user, trigger, session }: any) {
      // This is a callback that is used to create the token.
      if (user) {
        token.id = user.id;
        token.role = user.role;
        if (!user.name || user.name === "NO_NAME") {
          token.name = user.email.split("@")[0];
          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        }

        if (trigger === "signIn" || trigger === "signUp") {
          const cookiesObject = await cookies();
          const sessionCartId = cookiesObject.get("sessionCartId")?.value;

          if (sessionCartId) {
            const sessionCart = await prisma.cart.findFirst({
              where: { sessionCartId },
            });

            if (sessionCart) {
              // Delete current user cart
              await prisma.cart.deleteMany({
                where: { userId: user.id },
              });

              // Assign new cart
              await prisma.cart.update({
                where: { id: sessionCart.id },
                data: { userId: user.id },
              });
            }
          }
        }
      }

      if (session?.user.name && trigger === "update") {
        token.name = session.user.name;
      }
      // When user is undefined, just return the token.
      // In NextAuth, the user object is only provided during the initial sign-in. On subsequent calls (for token refreshes or session validations), only the token is passed, and the user object is expected to be undefined. This is standard behavior.
      return token;
    },
    authorized({ request }: any) {
      // This is a callback that is used to check if the user is authorized to access the page.
      if (!request.cookies.get("sessionCartId")) {
        // Generate new session cart id cookie
        const sessionCartId = crypto.randomUUID();

        // Clone the req headers
        const newRequestHeaders = new Headers(request.headers);

        // Create new response and add the new headers
        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders,
          },
        });

        // Set newly generated sessionCartId in the response cookies
        response.cookies.set("sessionCartId", sessionCartId);

        return response;
      } else {
        return true;
      }
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);

// handlers -> are the functions that are used to handle the authentication flow i.e. signIn, signOut, etc.
// auth -> is the authentication provider that is used to authenticate the user.
// signIn -> is the function that is used to sign in the user.
// signOut -> is the function that is used to sign out the user.
