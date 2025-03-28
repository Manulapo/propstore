// app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";  

// sessionProvider is a wrapper around the next-auth session context provider, which is used to manage user sessions in a Next.js application. It provides the session context to all components within the app, allowing them to access session data and manage authentication state. 

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
