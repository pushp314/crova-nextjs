import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getServerSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const existingUser = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!existingUser) {
          return null;
        }
        
        if (!existingUser.emailVerified) {
          throw new Error("Email not verified. Please check your inbox.");
        }

        if (existingUser.password) {
          const passwordMatch = await compare(credentials.password, existingUser.password);
          if (!passwordMatch) {
            return null;
          }
        } else {
            // User signed up with an OAuth provider and doesn't have a password
            return null;
        }

        return {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          image: existingUser.image,
          role: existingUser.role,
          emailVerified: existingUser.emailVerified,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // For Google provider, link account and mark email as verified
      if (account?.provider === 'google' && user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! }
        });
        if (dbUser && !dbUser.emailVerified) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { emailVerified: new Date() }
          });
        }
      }
        
      const dbUser = await prisma.user.findFirst({
        where: {
          email: token.email,
        },
      });

      if (!dbUser) {
        if (user) {
          token.id = user?.id;
        }
        return token;
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        role: dbUser.role,
      };
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    verifyRequest: '/verify-request', // A page to inform the user to check their email
  },
};

export const getCurrentUser = () => getServerSession(authOptions);
