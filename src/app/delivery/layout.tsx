
'use client';

import Link from 'next/link';
import { Package, LogOut } from 'lucide-react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/delivery/orders" className="flex items-center gap-2 font-semibold">
              <Package className="h-6 w-6" />
              <span className="">Delivery Panel</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            {/* Can add more nav links here in the future */}
          </div>
          <div className="mt-auto p-4">
             <Button variant="ghost" className="w-full justify-start" onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
         <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
             <Link href="/delivery/orders" className="flex items-center gap-2 font-semibold md:hidden">
              <Package className="h-6 w-6" />
              <span>Delivery Panel</span>
            </Link>
             <div className="ml-auto">
                <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
             </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8 bg-muted/40 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
