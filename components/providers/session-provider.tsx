'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

/**
 * Client-side wrapper for NextAuth SessionProvider.
 * Placed in a dedicated file so the server root layout stays a Server Component.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
