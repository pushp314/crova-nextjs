
'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getOrderStatusVariant, getPaymentStatusVariant } from '@/lib/utils';
import type { Order } from '@/lib/types';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/admin/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const LoadingSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-1/6" />
              <Skeleton className="h-12 w-2/6" />
              <Skeleton className="h-12 w-1/6" />
              <Skeleton className="h-12 w-1/6" />
              <Skeleton className="h-12 w-1/6" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>A list of all orders in the store.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  #{order.id.substring(0, 8)}...
                </TableCell>
                <TableCell>{order.user?.name || 'N/A'}</TableCell>
                <TableCell>{format(new Date(order.createdAt), 'PPP')}</TableCell>
                <TableCell>
                  <Badge variant={getOrderStatusVariant(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                 <TableCell>
                    <Badge variant={getPaymentStatusVariant(order.paymentStatus)} className="capitalize">
                      {order.paymentMethod} - {order.paymentStatus.toLowerCase()}
                    </Badge>
                </TableCell>
                <TableCell className="text-right">
                  ${order.totalAmount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {orders.length === 0 && !isLoading && (
          <p className="py-8 text-center text-muted-foreground">
            No orders found.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
