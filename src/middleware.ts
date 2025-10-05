import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isProtectedRoute = 
    pathname.startsWith('/profile') || 
    pathname.startsWith('/orders') ||
    pathname.startsWith('/cart') || 
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/wishlist');

  // If user is not authenticated
  if (!token) {
    if (isAdminRoute || isProtectedRoute) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // If user is authenticated
  const userRole = token.role;

  // Protect admin routes
  if (isAdminRoute) {
    if (userRole !== 'ADMIN') {
      // Redirect non-admins trying to access admin routes
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
    '/orders/:path*',
    '/admin/:path*',
    '/cart/:path*',
    '/checkout/:path*',
    '/wishlist/:path*',
  ],
};
