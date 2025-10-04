"use client";

import Link from 'next/link';
import { Heart, Menu, Search, ShoppingCart, User } from 'lucide-react';

import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Icons } from '@/components/icons';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '../ui/badge';

const navLinks = [
  { href: '/embroidered', label: 'Embroidered' },
  { href: '/women', label: 'Women' },
  { href: '/men',label: 'Men' },
];

export default function Header() {
  const { cartCount } = useCart();
  const isMobile = useIsMobile();
  
  const DesktopNav = () => (
    <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="transition-colors hover:text-foreground/80"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );

  const MobileNav = () => (
     <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <div className="flex flex-col gap-6 p-6">
          <Link href="/" className="mb-4">
            <Icons.logo className="h-6 w-auto" />
            <span className="sr-only">NOVA</span>
          </Link>
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg font-medium transition-colors hover:text-foreground/80"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="hidden items-center space-x-2 md:flex">
            <Icons.logo className="h-6 w-auto" />
            <span className="sr-only">NOVA</span>
          </Link>
          {isMobile ? <MobileNav /> : <DesktopNav />}
        </div>

        <div className="flex flex-1 items-center justify-center md:hidden">
          <Link href="/" className="items-center space-x-2">
            <Icons.logo className="h-6 w-auto" />
            <span className="sr-only">NOVA</span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
            <span className="sr-only">Wishlist</span>
          </Button>
          <Link href="/login" passHref>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
          </Link>
          <Link href="/cart" passHref>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge variant="destructive" className="absolute -right-2 -top-2 h-5 w-5 justify-center rounded-full p-0 text-xs">
                  {cartCount}
                </Badge>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
