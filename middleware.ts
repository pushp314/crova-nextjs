export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/profile/:path*",
    "/admin/:path*",
    "/cart/:path*",
    "/wishlist/:path*",
  ],
};
