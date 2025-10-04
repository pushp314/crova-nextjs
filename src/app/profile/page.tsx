'use client';

import { useSession, signOut } from 'next-auth/react';
import { User, ShoppingBag, Heart, LogOut, Loader2, Edit, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Order, UserProfile } from '@/lib/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { getOrderStatusVariant } from '@/lib/utils';
import { EditProfileDialog } from '@/components/profile/edit-profile-dialog';
import AddressManager from '@/components/profile/address-manager';


export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (status === 'authenticated') {
        setIsDataLoading(true);
        try {
          const [profileRes, ordersRes] = await Promise.all([
            fetch('/api/users/me'),
            fetch('/api/orders')
          ]);
          if (profileRes.ok) {
            setProfile(await profileRes.json());
          }
          if (ordersRes.ok) {
            setOrders(await ordersRes.json());
          }
        } catch (error) {
          console.error("Failed to fetch profile data:", error);
        } finally {
          setIsDataLoading(false);
        }
      }
    };
    fetchData();
  }, [status]);


  if (status === 'loading' || (status === 'authenticated' && isDataLoading)) {
    return (
      <div className="container py-12 md:py-24">
        <header className="mb-12 flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div>
                <Skeleton className="h-10 w-64" />
                <Skeleton className="mt-2 h-6 w-48" />
            </div>
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
  
  if (!profile) {
      return (
          <div className="container py-12 text-center">
              <p>Could not load profile. Please try again later.</p>
          </div>
      )
  }

  const userInitial = profile?.name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="container py-12 md:py-24">
      <header className="mb-12 flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile?.image || ''} alt={profile?.name || ''} />
          <AvatarFallback>{userInitial}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">My Account</h1>
          <p className="mt-1 text-muted-foreground">Welcome back, {profile?.name}!</p>
        </div>
      </header>

      <Tabs defaultValue="account" className="grid grid-cols-1 gap-12 md:grid-cols-4">
        <aside className="md:col-span-1">
          <TabsList className="h-auto flex-col items-stretch bg-transparent p-0">
              <TabsTrigger value="account" asChild>
                <Button variant="ghost" className="justify-start gap-2">
                  <User className="h-4 w-4" /> Account Details
                </Button>
              </TabsTrigger>
               <TabsTrigger value="addresses" asChild>
                <Button variant="ghost" className="justify-start gap-2">
                  <MapPin className="h-4 w-4" /> Shipping Addresses
                </Button>
              </TabsTrigger>
              <TabsTrigger value="orders" asChild>
                 <Button variant="ghost" className="justify-start gap-2">
                  <ShoppingBag className="h-4 w-4" /> Order History
                </Button>
              </TabsTrigger>
              <Button variant="ghost" asChild className="justify-start gap-2">
                <Link href="/wishlist">
                  <Heart className="h-4 w-4" />
                  Wishlist
                </Link>
              </Button>
              <Separator className="my-2"/>
              <Button 
                variant="ghost" 
                className="justify-start gap-2 text-destructive hover:text-destructive"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </Button>
          </TabsList>
        </aside>

        <main className="md:col-span-3">
          <TabsContent value="account">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details here.</CardDescription>
                </div>
                 <EditProfileDialog user={profile} onUpdate={setProfile}>
                    <Button variant="outline">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                    </Button>
                </EditProfileDialog>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-muted-foreground">{profile?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Email Address</p>
                  <p className="text-muted-foreground">{profile?.email}</p>
                </div>
                  <div className="space-y-1">
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-muted-foreground capitalize">{profile?.role?.toLowerCase()}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses">
            <AddressManager />
          </TabsContent>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Your Orders</CardTitle>
                <CardDescription>A list of your past and current orders.</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <ul className="space-y-4">
                    {orders.map(order => (
                       <li key={order.id}>
                        <Link href={`/orders/${order.id}`} className="block rounded-lg border p-4 transition-colors hover:bg-muted/50">
                           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <p className="font-semibold">Order #{order.id.substring(0,8)}...</p>
                                <p className="text-sm text-muted-foreground">Date: {format(new Date(order.createdAt), 'PPP')}</p>
                              </div>
                              <div className="flex w-full sm:w-auto items-center justify-between gap-4">
                                <p className="font-semibold">${order.totalAmount.toFixed(2)}</p>
                                <Badge variant={getOrderStatusVariant(order.status)} className="capitalize">
                                  {order.status.toLowerCase()}
                                </Badge>
                              </div>
                           </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">You haven't placed any orders yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </main>
      </Tabs>
    </div>
  );
}
