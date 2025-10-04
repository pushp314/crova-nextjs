import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isProtectedRoute = 
    pathname.startsWith('/profile') || 
    pathname.startsWith('/cart') || 
    pathname.startsWith('/wishlist');

  // If user is not authenticated
  if (!token) {
    if (isAdminRoute || isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  // If user is authenticated
  const userRole = token.role;

  // Protect admin routes
  if (isAdminRoute) {
    if (userRole !== 'ADMIN') {
      // Redirect non-admins trying to access admin routes
      // Redirecting to home page or a specific 'unauthorized' page might be better
      return NextResponse.redirect(new URL('/', req.url)); 
    }
  }

  // Allow access to protected routes for any authenticated user
  // and admin routes for admins
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/admin/:path*',
    '/cart/:path*',
    '/wishlist/:path*',
  ],
};
