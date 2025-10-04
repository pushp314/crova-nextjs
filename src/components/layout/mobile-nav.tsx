"use client";

import Link from 'next/link';
import { Home, Search, Heart, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/wishlist', icon: Heart, label: 'Wishlist' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  
  if (!isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className="grid h-16 grid-cols-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium",
                isActive ? "text-foreground" : "text-muted-foreground",
                "transition-colors hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
