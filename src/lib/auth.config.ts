import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// This config is used for middleware (Edge runtime) - no Prisma/database access
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Credentials provider needs authorize function, but in middleware
    // we only check if user is authenticated via JWT, not authorize
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // This won't be called in middleware - actual auth happens in auth.ts
      async authorize() {
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = nextUrl.pathname.startsWith("/dashboard") ||
                          nextUrl.pathname.startsWith("/items/new") ||
                          nextUrl.pathname.startsWith("/admin");
      
      if (isProtected && !isLoggedIn) {
        return false; // Redirect to sign in
      }
      return true;
    },
  },
  pages: {
    signIn: "/api/auth/signin",
  },
};
