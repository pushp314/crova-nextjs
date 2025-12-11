
import type { Metadata } from 'next';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { CartProvider } from '@/contexts/cart-context';
import { WishlistProvider } from '@/contexts/wishlist-context';
import { ConditionalLayout } from '@/components/layout/conditional-layout';
import { QueryProvider } from '@/components/providers/query-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { cn } from '@/lib/utils';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AuthProvider from '@/contexts/auth-provider';
import Script from 'next/script';
import { defaultMetadata, organizationJsonLd, websiteJsonLd } from '@/lib/seo';

export const metadata: Metadata = defaultMetadata;

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

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
      </head>
      <body className={cn('font-body antialiased')}>
        <AuthProvider>
          <QueryProvider>
            <WishlistProvider>
              <CartProvider>
                <ErrorBoundary>
                  <ConditionalLayout>
                    {children}
                  </ConditionalLayout>
                </ErrorBoundary>
                <Toaster />
                <SonnerToaster />
              </CartProvider>
            </WishlistProvider>
          </QueryProvider>
        </AuthProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </body>
    </html>
  );
}
