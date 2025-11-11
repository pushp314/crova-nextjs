
'use client';
import { useEffect, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { getOrderStatusVariant, getPaymentStatusVariant } from '@/lib/utils';
import type { Order, UserProfile } from '@/lib/types';
import { OrderStatus } from '@prisma/client';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryUsers, setDeliveryUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [ordersRes, usersRes] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/admin/users?role=DELIVERY'),
      ]);
      if (ordersRes.ok) {
        setOrders(await ordersRes.json());
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setDeliveryUsers(usersData.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update order status');
      const updatedOrder = await res.json();
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      toast.success(`Order #${orderId.substring(0,6)} status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update order status.');
    }
  };

  const handleAssignDelivery = async (orderId: string, assignedToId: string) => {
    try {
        const res = await fetch(`/api/admin/orders/${orderId}/assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assignedToId }),
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to assign order');
        }
        const updatedOrder = await res.json();
        setOrders(orders.map(o => o.id === orderId ? {...o, assignedToId: updatedOrder.assignedToId, assignedTo: updatedOrder.assignedTo } : o));
        toast.success(`Order assigned to ${updatedOrder.assignedTo.name}`);
    } catch(error: any) {
        toast.error('Assignment failed', { description: error.message });
    }
  };
  
  const orderStatuses: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_FAILED', 'CANCELLED'];

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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
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
                     <Select onValueChange={(value) => handleAssignDelivery(order.id, value)} value={order.assignedToId || ''}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Assign Delivery" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="unassign">Unassign</SelectItem>
                            {deliveryUsers.map(user => (
                                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{order.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              {orderStatuses.map(status => (
                                <DropdownMenuItem key={status} onSelect={() => handleStatusChange(order.id, status)}>
                                    {status}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {orders.length === 0 && !isLoading && (
          <p className="py-8 text-center text-muted-foreground">
            No orders found.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
