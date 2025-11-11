
'use client';

import { useState } from 'react';
import type { Order } from '@/lib/types';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { getOrderStatusVariant } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { OrderStatus } from '@prisma/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import Image from 'next/image';

interface OrderCardProps {
  order: Order;
  onUpdate: (order: Order) => void;
}

const possibleStatusUpdates: OrderStatus[] = [
    OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.DELIVERED,
    OrderStatus.DELIVERY_FAILED
];

export function OrderCard({ order, onUpdate }: OrderCardProps) {
  const [newStatus, setNewStatus] = useState<OrderStatus | undefined>();
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    if (!newStatus) {
      toast.warning('Please select a new status.');
      return;
    }

    setIsLoading(true);
    let deliveryProofUrl: string | undefined = undefined;

    try {
        if (proofFile) {
            const formData = new FormData();
            formData.append('file', proofFile);
            const uploadRes = await fetch('/api/upload?bucket=proofs', {
                method: 'POST',
                body: formData,
            });
            if (!uploadRes.ok) {
                const error = await uploadRes.json();
                throw new Error(error.message || 'Proof upload failed');
            }
            const { url } = await uploadRes.json();
            deliveryProofUrl = url;
        }

        const res = await fetch(`/api/delivery/orders/${order.id}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, deliveryProofUrl }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to update order status');
        }

        const updatedOrder = await res.json();
        onUpdate(updatedOrder);
        toast.success('Order status updated successfully');
        setNewStatus(undefined);
        setProofFile(null);

    } catch (error: any) {
        toast.error('Update failed', { description: error.message });
    } finally {
        setIsLoading(false);
    }
  };

  const isFinalStatus = order.status === OrderStatus.DELIVERED || order.status === OrderStatus.DELIVERY_FAILED;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                 <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
                <CardDescription>Placed on {format(new Date(order.createdAt), 'PP')}</CardDescription>
            </div>
            <Badge variant={getOrderStatusVariant(order.status)}>{order.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
            <h4 className="font-semibold text-sm">Customer</h4>
            <p className="text-muted-foreground text-sm">{order.user?.name}</p>
        </div>
        {order.shippingAddress && (
             <div>
                <h4 className="font-semibold text-sm">Shipping Address</h4>
                <address className="text-muted-foreground text-sm not-italic">
                    {order.shippingAddress.street}<br/>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </address>
            </div>
        )}
        {order.deliveryProofUrl && (
            <div>
                 <h4 className="font-semibold text-sm">Proof of Delivery</h4>
                 <div className="mt-2 relative w-full h-32 rounded-md overflow-hidden border">
                    <Image src={order.deliveryProofUrl} alt="Proof of delivery" layout="fill" objectFit="cover" />
                 </div>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-stretch space-y-2">
       {!isFinalStatus ? (
         <>
            <Select onValueChange={(v) => setNewStatus(v as OrderStatus)} value={newStatus}>
                <SelectTrigger>
                    <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                    {possibleStatusUpdates.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
             {newStatus === OrderStatus.DELIVERED && (
                 <div>
                    <label htmlFor={`proof-${order.id}`} className="text-sm font-medium">Proof (Optional)</label>
                    <Input id={`proof-${order.id}`} type="file" onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
                 </div>
             )}
            <Button onClick={handleUpdate} disabled={isLoading || !newStatus}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Update
            </Button>
         </>
       ): (
            <p className="text-sm text-center text-muted-foreground font-medium py-2">
                This order has been finalized.
            </p>
       )}
      </CardFooter>
    </Card>
  );
}
