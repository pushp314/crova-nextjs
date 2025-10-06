
import type { Metadata } from 'next';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { CartProvider } from '@/contexts/cart-context';
import { WishlistProvider } from '@/contexts/wishlist-context';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MobileBottomNav from '@/components/layout/mobile-nav';
import { cn } from '@/lib/utils';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AuthProvider from '@/contexts/auth-provider';
import Script from 'next/script';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'NOVA - Modern Fashion',
  description: 'A modern e-commerce fashion store.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased')}>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-grow container mt-16">{children}</main>
                <Footer />
              </div>
              <Suspense fallback={null}>
                <MobileBottomNav />
              </Suspense>
              <Toaster />
              <SonnerToaster />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </body>
    </html>
  );
}
