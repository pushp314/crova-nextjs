// This file will contain your Next.js middleware for protecting routes.
export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/profile/:path*",
    "/admin/:path*",
  ],
};
