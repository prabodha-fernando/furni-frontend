import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

export interface UserStoreItem {
  id: string
  name: string
  email: string
  password: string
  role: 'admin' | 'customer'
}

const globalForUsers = globalThis as unknown as { users: UserStoreItem[] }

export const USERS: UserStoreItem[] = globalForUsers.users || [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@furniture.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'customer',
  },
]

if (process.env.NODE_ENV !== 'production') {
  globalForUsers.users = USERS
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = USERS.find(
          (u) =>
            u.email.toLowerCase() === credentials.email.toLowerCase() &&
            u.password === credentials.password
        )

        if (!user) return null

        // Check if the selected login role matches the user's role in the DB
        if (credentials.role && user.role !== credentials.role) {
          throw new Error('RoleMismatch')
        }

        // Return a clean user object without the password
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),


    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // Always show the account selector popup for Google sign-in
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],

  pages: {
    signIn: '/login',
  },

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    /**
     * Embed the user's role into the JWT token so it survives across requests.
     * For Credentials users, role comes from the authorize() return value.
     * For Google users, we default to 'customer'.
     */
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? 'customer'
      }
      return token
    },

    /**
     * Expose the role on the session object so client components can read it
     * via useSession() without making additional API calls.
     */
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = (token.role as string) ?? 'customer'
      }
      return session
    },
  },
}
