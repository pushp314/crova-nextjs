'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import type { Product, CartItem } from '@/lib/types';
import { toast } from 'sonner';

interface CartResponse {
    id: string;
    items: CartItem[];
}

// Fetch functions
async function fetchCart(): Promise<CartResponse> {
    const res = await fetch('/api/cart');
    if (!res.ok) {
        if (res.status === 401) return { id: '', items: [] };
        throw new Error('Failed to fetch cart');
    }
    return res.json();
}

async function addToCartApi(productId: string, quantity: number): Promise<CartResponse> {
    const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
    });
    if (!res.ok) throw new Error('Failed to add to cart');
    return res.json();
}

async function updateCartQuantityApi(productId: string, quantity: number): Promise<CartResponse> {
    const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
    });
    if (!res.ok) throw new Error('Failed to update cart');
    return res.json();
}

async function removeFromCartApi(productId: string): Promise<void> {
    const res = await fetch(`/api/cart/${productId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to remove from cart');
}

async function clearCartApi(): Promise<void> {
    const res = await fetch('/api/cart/clear', { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to clear cart');
}

// Hooks

/**
 * Query hook for fetching cart data
 */
export function useCartQuery(enabled = true) {
    return useQuery({
        queryKey: queryKeys.cart.items(),
        queryFn: fetchCart,
        enabled,
        staleTime: 2 * 60 * 1000, // Cart data is more time-sensitive
    });
}

/**
 * Mutation hook for adding items to cart
 */
export function useAddToCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, quantity, product }: { productId: string; quantity: number; product: Product }) =>
            addToCartApi(productId, quantity),
        onMutate: async ({ productId, quantity, product }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: queryKeys.cart.items() });

            // Snapshot previous value
            const previousCart = queryClient.getQueryData<CartResponse>(queryKeys.cart.items());

            // Optimistically update cart
            queryClient.setQueryData<CartResponse>(queryKeys.cart.items(), (old) => {
                if (!old) return { id: '', items: [] };

                const existingItem = old.items.find((item) => item.productId === productId);
                if (existingItem) {
                    return {
                        ...old,
                        items: old.items.map((item) =>
                            item.productId === productId
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        ),
                    };
                }

                return {
                    ...old,
                    items: [...old.items, { productId, quantity, product } as CartItem],
                };
            });

            return { previousCart };
        },
        onError: (err, variables, context) => {
            // Rollback on error
            if (context?.previousCart) {
                queryClient.setQueryData(queryKeys.cart.items(), context.previousCart);
            }
            toast.error('Failed to add to cart', {
                description: 'Could not add item. Please try again.',
            });
        },
        onSuccess: (data, variables) => {
            // Update with server response
            queryClient.setQueryData(queryKeys.cart.items(), data);
            toast.success('Added to cart', {
                description: `${variables.product.name} has been added to your cart.`,
            });
        },
    });
}

/**
 * Mutation hook for updating cart item quantity
 */
export function useUpdateCartQuantity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
            updateCartQuantityApi(productId, quantity),
        onMutate: async ({ productId, quantity }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.cart.items() });

            const previousCart = queryClient.getQueryData<CartResponse>(queryKeys.cart.items());

            // Optimistic update
            queryClient.setQueryData<CartResponse>(queryKeys.cart.items(), (old) => {
                if (!old) return old;
                return {
                    ...old,
                    items: old.items.map((item) =>
                        item.productId === productId ? { ...item, quantity } : item
                    ),
                };
            });

            return { previousCart };
        },
        onError: (err, variables, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData(queryKeys.cart.items(), context.previousCart);
            }
            toast.error('Failed to update quantity');
        },
    });
}

/**
 * Mutation hook for removing items from cart
 */
export function useRemoveFromCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productId: string) => removeFromCartApi(productId),
        onMutate: async (productId) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.cart.items() });

            const previousCart = queryClient.getQueryData<CartResponse>(queryKeys.cart.items());

            // Optimistic removal
            queryClient.setQueryData<CartResponse>(queryKeys.cart.items(), (old) => {
                if (!old) return old;
                return {
                    ...old,
                    items: old.items.filter((item) => item.productId !== productId),
                };
            });

            return { previousCart };
        },
        onError: (err, variables, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData(queryKeys.cart.items(), context.previousCart);
            }
            toast.error('Failed to remove item');
        },
        onSuccess: () => {
            toast.info('Item removed from cart');
        },
    });
}

/**
 * Mutation hook for clearing cart
 */
export function useClearCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: clearCartApi,
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: queryKeys.cart.items() });
            const previousCart = queryClient.getQueryData<CartResponse>(queryKeys.cart.items());
            queryClient.setQueryData<CartResponse>(queryKeys.cart.items(), { id: '', items: [] });
            return { previousCart };
        },
        onError: (err, variables, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData(queryKeys.cart.items(), context.previousCart);
            }
            toast.error('Failed to clear cart');
        },
        onSuccess: () => {
            toast.info('Cart cleared');
        },
    });
}
