/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { NextAuthConfig } from 'next-auth';
import { prisma } from '@/db/prisma'
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from "next-auth/providers/credentials"
import { compareSync } from 'bcrypt-ts-edge';


export const config = {
    pages: {
        signIn: '/sign-in', // This is the page that the user will be redirected to when they are not signed in.
        error: '/sign-in', // This is the page that the user will be redirected to when there is an error.
    },
    session: {
        strategy: 'jwt', // This is the strategy that is used to authenticate the user meaning that the user will be authenticated using a JSON Web Token.
        maxAge: 30 * 24 * 60 * 60, // This is the maximum age of the session i.e. the session will expire after 30 days.
    },
    adapter: PrismaAdapter(prisma), // An adapter is a piece of code that is used to connect to the database.
    providers: [
        CredentialsProvider({
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                // Find user by email only
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                    select: { id: true, name: true, email: true, password: true, role: true }
                });

                // If no user or no password, return null
                if (!user || !user.password) return null;

                // Compare hashed password
                const isValidPassword = compareSync(credentials.password as string, user.password);
                if (!isValidPassword) return null;

                // Return user data (excluding password)
                return { id: user.id, name: user.name, email: user.email, role: user.role };
            }
        })
    ],
    callbacks: {
        async session({ session, user, trigger, token }: any) {
            //set userid from the token
            session.user.id = token.sub; // the sub is the user id that is stored in the token
            session.user.role = token.role;
            session.user.name = token.name;

            //if thee is an update ,set the user name (our app allows to change name)
            if (trigger === 'update') {
                session.user.name = user.name;
            }

            return session;
        }, // This is the provider that is used to authenticate the user. credentials is the provider that is used to authenticate the user using a username and password.
        async jwt({ token, user }: any) {
            token.role = user.role;

            // user has no name use the first part of the email as the name
            if (!user.name || user.name === 'NO_NAME') {
                const name = user.email.split('@')[0];
                token.name = name;
                // update database with the new name
                await prisma.user.update({
                    where: { id: user.id },
                    data: { name: token.name }
                });

                return token;
            } 

        }
    },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);

// handlers -> are the functions that are used to handle the authentication flow i.e. signIn, signOut, etc.
// auth -> is the authentication provider that is used to authenticate the user.
// signIn -> is the function that is used to sign in the user.
// signOut -> is the function that is used to sign out the user.


