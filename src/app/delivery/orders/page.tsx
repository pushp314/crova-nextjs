
'use client';

import { useEffect, useState } from 'react';
import type { Order } from '@/lib/types';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderCard } from '@/components/delivery/OrderCard';

const LoadingSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <div className="p-6 pt-0 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    ))}
  </div>
);

export default function DeliveryOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/delivery/orders');
      if (res.ok) {
        setOrders(await res.json());
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to load assigned orders.');
      }
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load assigned orders.', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onOrderUpdate = (updatedOrder: Order) => {
    setOrders(prevOrders => prevOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };


  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div>
        <div className="mb-8">
            <h1 className="text-3xl font-bold">Assigned Orders</h1>
            <p className="text-muted-foreground">Manage and update the status of your assigned deliveries.</p>
        </div>
        {orders.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {orders.map(order => (
                    <OrderCard key={order.id} order={order} onUpdate={onOrderUpdate} />
                ))}
            </div>
        ) : (
             <Card>
                <CardHeader>
                    <CardTitle>No Orders Assigned</CardTitle>
                    <CardDescription>You currently have no orders assigned for delivery.</CardDescription>
                </CardHeader>
            </Card>
        )}
    </div>
  );
}
