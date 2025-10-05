'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { Order } from '@/lib/types';
import { getOrderStatusVariant, getPaymentStatusVariant } from '@/lib/utils';
import Link from 'next/link';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params; 

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) {
          throw new Error('Order not found');
        }
        const data = await res.json();
        setOrder(data);
      } catch (error) {
        setOrder(null);
        console.error('Failed to fetch order details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (isLoading) {
    return (
        <div className="py-12 md:py-24">
            <div className="mb-8">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="mt-2 h-5 w-1/2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
    );
  }

  if (!order) {
    return notFound();
  }

  return (
    <div className="py-12 md:py-24">
       <div className="mb-8">
            <h1 className="text-3xl font-bold md:text-4xl">Order Details</h1>
            <p className="text-muted-foreground mt-2">
                Order #{order.id.substring(0, 8)}... &bull; Placed on {format(new Date(order.createdAt), 'PPP')}
            </p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Items Ordered</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="w-[100px] text-center">Quantity</TableHead>
                                <TableHead className="w-[120px] text-right">Price</TableHead>
                                <TableHead className="w-[120px] text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <Image
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                                width={64}
                                                height={80}
                                                className="rounded-md object-cover"
                                            />
                                            <div className="flex flex-col">
                                                <Link href={`/product/${item.productId}`} className="font-medium hover:underline">{item.product.name}</Link>
                                                <span className="text-sm text-muted-foreground">
                                                  ${item.price.toFixed(2)} each
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-medium">${(item.price * item.quantity).toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Order Status</span>
                         <Badge variant={getOrderStatusVariant(order.status)} className="capitalize">
                            {order.status.toLowerCase()}
                        </Badge>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Method</span>
                        <span className="capitalize">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Status</span>
                        <Badge variant={getPaymentStatusVariant(order.paymentStatus)} className="capitalize">
                            {order.paymentStatus.toLowerCase()}
                        </Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                        <span>Total Amount</span>
                        <span>${order.totalAmount.toFixed(2)}</span>
                    </div>
                </CardContent>
            </Card>

             {order.shippingAddress && (
                <Card>
                    <CardHeader>
                        <CardTitle>Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <p>{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                        <p>{order.shippingAddress.country}</p>
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}