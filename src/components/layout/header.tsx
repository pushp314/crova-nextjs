
"use client";

import Link from 'next/link';
import { Heart, Search, ShoppingCart, User, X } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Badge } from '../ui/badge';
import { useWishlist } from '@/contexts/wishlist-context';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/women', label: 'Women' },
  { href: '/men',label: 'Men' },
];

export default function Header() {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
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
          className="transition-colors text-foreground/60 hover:text-foreground/80"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="hidden items-center space-x-2 md:flex">
            <Icons.logo />
            <span className="sr-only">NOVA</span>
          </Link>
          <DesktopNav />
        </div>

        <div className="flex flex-1 items-center justify-center md:hidden">
           <AnimatePresence>
            {!showSearch && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Link href="/" className="items-center space-x-2">
                    <Icons.logo />
                    <span className="sr-only">NOVA</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-1 md:space-x-2">
          <div className="hidden md:flex flex-1 justify-center relative">
             <AnimatePresence>
              {showSearch && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '100%', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-sm"
                >
                  <form onSubmit={handleSearch} className="relative w-full">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      name="search"
                      placeholder="Search..."
                      className="h-9 pl-10 w-full rounded-full bg-secondary border-none"
                      autoFocus
                      onBlur={() => setShowSearch(false)}
                    />
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute left-0 right-0 top-0 flex h-full items-center bg-background px-4 md:hidden"
              >
                <form onSubmit={handleSearch} className="flex w-full items-center gap-2">
                  <Input
                    type="search"
                    name="search"
                    placeholder="Search products..."
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

          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)} className={cn("flex", showSearch && 'hidden')}>
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
            </Button>
            <Link href="/profile" passHref>
              <Button variant="ghost" size="icon" className={cn("flex", showSearch && 'hidden')}>
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
            </Link>
            <Link href="/wishlist" passHref>
              <Button variant="ghost" size="icon" className={cn("relative", "flex", showSearch && 'hidden')}>
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge variant="destructive" className="absolute -right-2 -top-2 h-5 w-5 justify-center rounded-full p-0 text-xs">
                    {wishlistCount}
                  </Badge>
                )}
                <span className="sr-only">Wishlist</span>
              </Button>
            </Link>
            <Link href="/cart" passHref>
              <Button variant="ghost" size="icon" className={cn("relative", "flex", showSearch && 'hidden')}>
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
      </div>
    </header>
  );
}
