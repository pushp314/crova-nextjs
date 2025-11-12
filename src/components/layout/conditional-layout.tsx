'use client';

import { usePathname } from 'next/navigation';
import Header from './header';
import Footer from './footer';
import MobileBottomNav from './mobile-nav';
import TopTickerBanner from '../ui/TopTickerBanner';
import { Suspense } from 'react';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    // Admin routes: no header, footer, or banner
    return <>{children}</>;
  }

  // Regular routes: full layout
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <TopTickerBanner />
      <main className="flex-grow container" style={{ marginTop: 'calc(4rem + var(--banner-height, 0px))' }}>
        {children}
      </main>
      <Footer />
      <Suspense fallback={null}>
        <MobileBottomNav />
      </Suspense>
    </div>
  );
}
