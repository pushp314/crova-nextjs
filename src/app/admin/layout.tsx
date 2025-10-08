
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


const AdminNav = ({ isMobile = false }: { isMobile?: boolean }) => {
  const pathname = usePathname();
  const linkClass = isMobile
    ? 'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground'
    : 'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary';
  const activeClass = isMobile ? 'bg-muted text-foreground' : 'bg-muted text-primary';

  return (
    <nav className={cn(
      "grid items-start text-sm font-medium",
      isMobile ? "gap-2 text-lg" : "px-2 lg:px-4"
    )}>
       {isMobile && (
         <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold mb-4"
          >
            <Icons.logo />
            <span className="sr-only">NOVA</span>
          </Link>
       )}
      {navItems.map((item) => {
        const isActive = (item.href === '/admin' && pathname === item.href) || 
                         (item.href !== '/admin' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(linkClass, isActive && activeClass)}
          >
            <item.icon className={cn("h-4 w-4", isMobile && "h-5 w-5")} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  );
};


const DesktopSidebar = () => (
  <div className="hidden border-r bg-background md:block">
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-16 items-center border-b px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Icons.logo />
          <span className="">NOVA</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <AdminNav />
      </div>
    </div>
  </div>
);


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DesktopSidebar />
      <div className="flex flex-col">
        <AdminHeader>
           <AdminNav isMobile />
        </AdminHeader>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}

