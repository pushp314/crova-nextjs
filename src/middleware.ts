
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@prisma/client';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isDeliveryRoute = pathname.startsWith('/delivery');
  const isApiAdminRoute = pathname.startsWith('/api/admin');
  const isApiDeliveryRoute = pathname.startsWith('/api/delivery');
  
  const isProtectedRoute = 
    pathname.startsWith('/profile') || 
    pathname.startsWith('/orders') ||
    pathname.startsWith('/cart') || 
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/wishlist');

  // If user is not authenticated
  if (!token) {
    if (isAdminRoute || isDeliveryRoute || isProtectedRoute || isApiAdminRoute || isApiDeliveryRoute) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      // For API routes, return a JSON response instead of redirecting
      if(pathname.startsWith('/api/')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // If user is authenticated
  const userRole = token.role as UserRole;

  // Protect admin routes
  if (isAdminRoute || isApiAdminRoute) {
    if (userRole !== UserRole.ADMIN) {
       if(pathname.startsWith('/api/')) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/', req.url)); 
    }
  }

  // Protect delivery routes
  if(isDeliveryRoute || isApiDeliveryRoute) {
    if(userRole !== UserRole.DELIVERY) {
       if(pathname.startsWith('/api/')) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/', req.url));
    }
  }


  // If user is trying to access login/signup while already logged in
  if (pathname === '/login' || pathname === '/signup') {
    return NextResponse.redirect(new URL('/profile', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/orders/:path*',
    '/cart/:path*',
    '/checkout/:path*',
    '/wishlist/:path*',
    '/admin/:path*',
    '/delivery/:path*',
    '/api/admin/:path*',
    '/api/delivery/:path*',
    '/api/upload',
    '/login',
    '/signup',
  ],
};
