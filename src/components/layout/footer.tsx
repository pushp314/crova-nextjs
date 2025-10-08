
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4 md:col-span-1">
            <h3 className="text-lg font-semibold">Join our newsletter</h3>
            <p className="text-sm text-muted-foreground">
              Get exclusive updates, new arrivals, and insider-only discounts.
            </p>
            <form className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-grow"
              />
              <Button type="submit" variant="default">Subscribe</Button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm md:col-span-3 md:grid-cols-3">
            <div className="space-y-3">
              <h4 className="font-semibold">Shop</h4>
              <ul className="space-y-2">
                <li><Link href="/women" className="text-muted-foreground hover:text-foreground">Women</Link></li>
                <li><Link href="/men" className="text-muted-foreground hover:text-foreground">Men</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">New Arrivals</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Press</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Affiliates</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Support</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Contact Us</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">FAQ</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Shipping & Returns</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Track Order</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t pt-8 text-sm md:flex-row">
          <p className="text-muted-foreground">&copy; {new Date().getFullYear()} NOVA. All Rights Reserved.</p>
          <div className="mt-4 flex space-x-4 md:mt-0">
            <Link href="#" aria-label="Facebook">
              <Icons.facebook className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </Link>
            <Link href="#" aria-label="Instagram">
              <Icons.instagram className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </Link>
            <Link href="#" aria-label="Twitter">
              <Icons.twitter className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
