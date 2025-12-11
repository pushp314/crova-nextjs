'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import type { Product, WishlistItem } from '@/lib/types';
import { toast } from 'sonner';

interface WishlistResponse {
    id: string;
    items: WishlistItem[];
}

// Fetch functions
async function fetchWishlist(): Promise<WishlistResponse> {
    const res = await fetch('/api/wishlist');
    if (!res.ok) {
        if (res.status === 401) return { id: '', items: [] };
        throw new Error('Failed to fetch wishlist');
    }
    return res.json();
}

async function addToWishlistApi(productId: string): Promise<WishlistResponse> {
    const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
    });
    if (!res.ok) throw new Error('Failed to add to wishlist');
    return res.json();
}

async function removeFromWishlistApi(productId: string): Promise<void> {
    const res = await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to remove from wishlist');
}

// Hooks

/**
 * Query hook for fetching wishlist data
 */
export function useWishlistQuery(enabled = true) {
    return useQuery({
        queryKey: queryKeys.wishlist.items(),
        queryFn: fetchWishlist,
        enabled,
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Mutation hook for adding items to wishlist
 */
export function useAddToWishlist() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, product }: { productId: string; product: Product }) =>
            addToWishlistApi(productId),
        onMutate: async ({ productId, product }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.wishlist.items() });

            const previousWishlist = queryClient.getQueryData<WishlistResponse>(queryKeys.wishlist.items());

            // Optimistically add to wishlist
            queryClient.setQueryData<WishlistResponse>(queryKeys.wishlist.items(), (old) => {
                if (!old) return { id: '', items: [] };

                // Check if already exists
                if (old.items.some((item) => item.productId === productId)) {
                    return old;
                }

                return {
                    ...old,
                    items: [...old.items, { productId, product } as WishlistItem],
                };
            });

            return { previousWishlist };
        },
        onError: (err, variables, context) => {
            if (context?.previousWishlist) {
                queryClient.setQueryData(queryKeys.wishlist.items(), context.previousWishlist);
            }
            toast.error('Failed to add to wishlist');
        },
        onSuccess: (data, variables) => {
            queryClient.setQueryData(queryKeys.wishlist.items(), data);
            toast.success('Added to wishlist', {
                description: `${variables.product.name} has been added to your wishlist.`,
            });
        },
    });
}

/**
 * Mutation hook for removing items from wishlist
 */
export function useRemoveFromWishlist() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, productName }: { productId: string; productName?: string }) =>
            removeFromWishlistApi(productId),
        onMutate: async ({ productId }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.wishlist.items() });

            const previousWishlist = queryClient.getQueryData<WishlistResponse>(queryKeys.wishlist.items());

            // Optimistic removal
            queryClient.setQueryData<WishlistResponse>(queryKeys.wishlist.items(), (old) => {
                if (!old) return old;
                return {
                    ...old,
                    items: old.items.filter((item) => item.productId !== productId),
                };
            });

            return { previousWishlist };
        },
        onError: (err, variables, context) => {
            if (context?.previousWishlist) {
                queryClient.setQueryData(queryKeys.wishlist.items(), context.previousWishlist);
            }
            toast.error('Failed to remove from wishlist');
        },
        onSuccess: (_, variables) => {
            toast.info('Removed from wishlist', {
                description: variables.productName
                    ? `${variables.productName} has been removed from your wishlist.`
                    : undefined,
            });
        },
    });
}

/**
 * Helper hook to check if a product is wishlisted
 */
export function useIsWishlisted(productId: string): boolean {
    const { data } = useWishlistQuery();
    return data?.items.some((item) => item.productId === productId) ?? false;
}
