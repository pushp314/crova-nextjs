import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getServerSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";
import { compare } from "bcrypt";
import type { UserRole } from "@prisma/client";

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
          throw new Error("No user found with this email.");
        }
        
        if (!existingUser.emailVerified) {
          throw new Error("Email not verified. Please check your inbox.");
        }

        if (!existingUser.password) {
          // User signed up with an OAuth provider and doesn't have a password
           throw new Error("This account was created with a social provider. Please use Google to sign in.");
        }
        
        const passwordMatch = await compare(credentials.password, existingUser.password);
        if (!passwordMatch) {
          throw new Error("Incorrect password.");
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
      const dbUser = await prisma.user.findFirst({
        where: {
          email: token.email!,
        },
      });

      if (!dbUser) {
        if (user) {
          token.id = user.id;
        }
        return token;
      }
      
      // On first sign in (Google), link account and mark email as verified if needed
      if (account?.provider === 'google' && !dbUser.emailVerified) {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { 
            emailVerified: new Date(),
            welcomeEmailSent: true, // Mark welcome email as sent
          }
        });
        
        // Send welcome email for first-time Google sign-ins
        try {
          const { sendWelcomeEmail } = await import('./mail');
          const firstName = dbUser.name?.split(' ')[0] || 'there';
          await sendWelcomeEmail(dbUser.email!, firstName);
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
        }
      }

      token.id = dbUser.id;
      token.name = dbUser.name;
      token.email = dbUser.email!;
      token.picture = dbUser.image;
      token.role = dbUser.role;

      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
};

export const getCurrentUser = () => getServerSession(authOptions);
