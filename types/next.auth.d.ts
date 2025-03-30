import { DefaultSession } from "next-auth";

// This file is used to extend the NextAuth session type to include the user role
// and to add the user role to the session object.  
declare module "next-auth" {
  export interface Session {
    user: {
      role: string;
    } & DefaultSession["user"];
  }
}
