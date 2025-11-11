
import type { Session } from "next-auth";
import { UserRole } from "@prisma/client";

/**
 * Checks if the current session's user has one of the specified roles.
 * Throws an error if the user is not authenticated or does not have the required role.
 * @param session - The NextAuth session object.
 * @param roles - An array of roles that are allowed.
 * @returns The session if the user has the required role.
 */
export function requireRole(session: Session | null, roles: UserRole[]): Session {
  if (!session?.user?.role || !roles.includes(session.user.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

/**
 * Checks if the user in the session is an ADMIN.
 * @param session - The NextAuth session object.
 * @returns True if the user is an ADMIN, false otherwise.
 */
export const isAdmin = (session: Session | null): boolean => {
  return session?.user?.role === UserRole.ADMIN;
};

/**
 * Checks if the user in the session is a DELIVERY user.
 * @param session - The NextAuth session object.
 * @returns True if the user is a DELIVERY user, false otherwise.
 */
export const isDelivery = (session: Session | null): boolean => {
    return session?.user?.role === UserRole.DELIVERY;
};
