
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ShoppingCart, Users, Tag, PanelLeft, Settings, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession, signOut } from 'next-auth/react';


const navItems = [
  { href: '/admin', icon: Home, label: 'Dashboard' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/categories', icon: Tag, label: 'Categories' },
  { href: '/admin/users', icon: Users, label: 'Customers' },
  { href: '/admin/banners', icon: Megaphone, label: 'Banners' },
];

const AdminNav = () => {
  const pathname = usePathname();
  
  return (
    <nav className="grid items-start gap-1 px-4 text-sm font-medium">
      {navItems.map((item) => {
        const isActive = (item.href === '/admin' && pathname === item.href) || 
                         (item.href !== '/admin' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                isActive && 'bg-muted text-primary'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  );
};


const Sidebar = () => {
    const { data: session } = useSession();
    const user = session?.user;
    const userInitial = user?.name?.charAt(0).toUpperCase() || '?';

    return (
        <div className="flex h-full max-h-screen flex-col">
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                <Icons.logo />
                <span className="">CROVA</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <AdminNav />
            </div>
            <div className="mt-auto border-t p-4">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-3 w-full justify-start px-2">
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
                                <AvatarFallback>{userInitial}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-medium leading-none">{user?.name}</span>
                                <span className="text-xs text-muted-foreground leading-none">{user?.email}</span>
                            </div>
                            <Settings className="ml-auto h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild><Link href="/">Storefront</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
      </div>
    )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="fixed inset-0 grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] overflow-hidden">
        <div className="hidden border-r bg-muted/40 md:block h-screen overflow-y-auto">
            <Sidebar />
        </div>
        <div className="flex flex-col h-screen overflow-hidden">
            <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 md:hidden flex-shrink-0">
                 <Sheet>
                    <SheetTrigger asChild>
                        <Button size="icon" variant="outline">
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Toggle Navigation</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-full max-w-xs p-0 h-screen">
                       <SheetHeader>
                          <SheetTitle className="sr-only">Admin Menu</SheetTitle>
                       </SheetHeader>
                       <Sidebar />
                    </SheetContent>
                </Sheet>
                 <div className="flex-1 text-center font-semibold">
                    Admin Dashboard
                 </div>
            </header>
            <main className="flex-1 flex flex-col gap-4 p-4 lg:gap-6 lg:p-8 bg-muted/40 overflow-y-auto">
                {children}
            </main>
        </div>
    </div>
  );
}
