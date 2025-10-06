
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ShoppingCart, Users, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import AdminHeader from '@/components/admin/admin-header';

const navItems = [
  { href: '/admin', icon: Home, label: 'Dashboard' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/categories', icon: Tag, label: 'Categories' },
  { href: '/admin/users', icon: Users, label: 'Customers' },
];

const DesktopSidebar = ({ pathname }: { pathname: string }) => (
  <div className="hidden border-r bg-muted/40 md:block">
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-16 items-center border-b px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Icons.logo />
          <span className="">NOVA</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                (pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))) && 'bg-muted text-primary'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  </div>
);


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DesktopSidebar pathname={pathname} />
      <div className="flex flex-col">
        <AdminHeader navItems={navItems} />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}
