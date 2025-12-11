'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { toast } from 'sonner';

interface Order {
    id: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    items: Array<{
        id: string;
        quantity: number;
        price: number;
        product: {
            id: string;
            name: string;
            images: string[];
        };
    }>;
}

// Fetch functions
async function fetchOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders');
    if (!res.ok) {
        if (res.status === 401) return [];
        throw new Error('Failed to fetch orders');
    }
    return res.json();
}

async function fetchOrder(id: string): Promise<Order> {
    const res = await fetch(`/api/orders/${id}`);
    if (!res.ok) throw new Error('Failed to fetch order');
    return res.json();
}

async function createOrderApi(): Promise<Order> {
    const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create order');
    }
    return res.json();
}

// Hooks

/**
 * Query hook for fetching user's orders
 */
export function useOrders(enabled = true) {
    return useQuery({
        queryKey: queryKeys.orders.list(),
        queryFn: fetchOrders,
        enabled,
        staleTime: 1 * 60 * 1000, // Orders can change frequently
    });
}

/**
 * Query hook for fetching a single order
 */
export function useOrder(id: string) {
    return useQuery({
        queryKey: queryKeys.orders.detail(id),
        queryFn: () => fetchOrder(id),
        enabled: !!id,
    });
}

/**
 * Mutation hook for creating an order from cart
 */
export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createOrderApi,
        onSuccess: (newOrder) => {
            // Invalidate orders list to refetch
            queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
            // Clear cart cache (order creation clears the cart)
            queryClient.setQueryData(queryKeys.cart.items(), { id: '', items: [] });

            toast.success('Order placed successfully!', {
                description: `Order #${newOrder.id.slice(0, 8)} has been created.`,
            });
        },
        onError: (error: Error) => {
            toast.error('Failed to create order', {
                description: error.message,
            });
        },
    });
}
