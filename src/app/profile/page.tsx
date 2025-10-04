'use client';

import { useSession, signOut } from 'next-auth/react';
import { User, ShoppingBag, Heart, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

const orders = [
  { id: 'ORD001', date: '2024-07-15', total: 189.99, status: 'Shipped' },
  { id: 'ORD002', date: '2024-07-20', total: 45.00, status: 'Processing' },
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="container py-12 md:py-24">
        <header className="mb-12">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="mt-2 h-6 w-1/4" />
        </header>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <aside className="md:col-span-1">
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </aside>
          <main className="md:col-span-3">
            <Skeleton className="h-96 w-full" />
          </main>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }
  
  const user = session?.user;
  const userInitial = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="container py-12 md:py-24">
      <header className="mb-12 flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
          <AvatarFallback>{userInitial}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">My Account</h1>
          <p className="mt-1 text-muted-foreground">Welcome back, {user?.name}!</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
        <aside className="md:col-span-1">
          <nav className="flex flex-col space-y-2">
            <Button variant="ghost" className="justify-start gap-2">
              <User className="h-4 w-4" />
              Account Details
            </Button>
            <Button variant="ghost" className="justify-start gap-2">
              <ShoppingBag className="h-4 w-4" />
              Order History
            </Button>
            <Button variant="ghost" asChild className="justify-start gap-2">
              <Link href="/wishlist">
                <Heart className="h-4 w-4" />
                Wishlist
              </Link>
            </Button>
            <Separator />
            <Button 
              variant="ghost" 
              className="justify-start gap-2 text-destructive hover:text-destructive"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </nav>
        </aside>

        <main className="md:col-span-3">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="account">Account Details</TabsTrigger>
              <TabsTrigger value="orders">Order History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details here.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-muted-foreground">{user?.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Email Address</p>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                   <div className="space-y-1">
                    <p className="text-sm font-medium">Role</p>
                    <p className="text-muted-foreground capitalize">{user?.role?.toLowerCase()}</p>
                  </div>
                  <Button className="mt-4" disabled>Edit Profile</Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Your Orders</CardTitle>
                  <CardDescription>A list of your past and current orders.</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length > 0 ? (
                    <ul className="space-y-6">
                      {orders.map(order => (
                        <li key={order.id} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-semibold">{order.id}</p>
                            <p className="text-sm text-muted-foreground">Date: {order.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${order.total.toFixed(2)}</p>
                            <p className={`text-sm font-medium ${order.status === 'Shipped' ? 'text-green-600' : 'text-amber-600'}`}>{order.status}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
