"use client";

import Link from 'next/link';
import { Heart, Menu, Search, ShoppingCart, User, X } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Icons } from '@/components/icons';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '../ui/badge';
import { useWishlist } from '@/contexts/wishlist-context';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/input';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { href: '/women', label: 'Women' },
  { href: '/men',label: 'Men' },
];

export default function Header() {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const isMobile = useIsMobile();
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get('search') as string;
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowSearch(false);
    }
  };
  
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

        <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '100%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute left-0 right-0 top-0 h-full bg-background px-4 md:relative md:flex md:flex-1 md:items-center md:justify-center md:px-0"
          >
            <form onSubmit={handleSearch} className="flex w-full items-center gap-2">
              <Input
                type="search"
                name="search"
                placeholder="Search for products..."
                className="h-9 flex-1"
                autoFocus
              />
              <Button type="submit" size="icon" variant="ghost">
                <Search className="h-5 w-5" />
              </Button>
              <Button type="button" size="icon" variant="ghost" onClick={() => setShowSearch(false)}>
                <X className="h-5 w-5" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>


        <div className="flex flex-1 items-center justify-center md:hidden">
         {!showSearch && (
             <Link href="/" className="items-center space-x-2">
                <Icons.logo className="h-6 w-auto" />
                <span className="sr-only">NOVA</span>
            </Link>
         )}
        </div>
        
        <AnimatePresence>
        {!showSearch && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 items-center justify-end space-x-2 md:space-x-4"
            >
              <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
              <Link href="/wishlist" passHref>
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <Badge variant="destructive" className="absolute -right-2 -top-2 h-5 w-5 justify-center rounded-full p-0 text-xs">
                      {wishlistCount}
                    </Badge>
                  )}
                  <span className="sr-only">Wishlist</span>
                </Button>
              </Link>
              <Link href="/profile" passHref>
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
            </motion.div>
        )}
        </AnimatePresence>
      </div>
    </header>
  );
}
