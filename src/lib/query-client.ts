'use client';

import { QueryClient } from '@tanstack/react-query';

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Data remains fresh for 5 minutes
                staleTime: 5 * 60 * 1000,
                // Cache data for 30 minutes
                gcTime: 30 * 60 * 1000,
                // Retry failed requests up to 3 times with exponential backoff
                retry: 3,
                retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
                // Don't refetch on window focus for better UX
                refetchOnWindowFocus: false,
                // Refetch on reconnect
                refetchOnReconnect: true,
            },
            mutations: {
                // Retry mutations once
                retry: 1,
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
    if (typeof window === 'undefined') {
        // Server: always create a new QueryClient
        return makeQueryClient();
    } else {
        // Browser: reuse the same QueryClient
        if (!browserQueryClient) browserQueryClient = makeQueryClient();
        return browserQueryClient;
    }
}

// Query keys factory for type-safe and consistent query keys
export const queryKeys = {
    // Products
    products: {
        all: ['products'] as const,
        lists: () => [...queryKeys.products.all, 'list'] as const,
        list: (filters: Record<string, unknown>) => [...queryKeys.products.lists(), filters] as const,
        featured: () => [...queryKeys.products.all, 'featured'] as const,
        details: () => [...queryKeys.products.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.products.details(), id] as const,
    },
    // Cart
    cart: {
        all: ['cart'] as const,
        items: () => [...queryKeys.cart.all, 'items'] as const,
    },
    // Wishlist
    wishlist: {
        all: ['wishlist'] as const,
        items: () => [...queryKeys.wishlist.all, 'items'] as const,
    },
    // Orders
    orders: {
        all: ['orders'] as const,
        list: () => [...queryKeys.orders.all, 'list'] as const,
        detail: (id: string) => [...queryKeys.orders.all, 'detail', id] as const,
    },
    // Categories
    categories: {
        all: ['categories'] as const,
    },
    // Banners
    banners: {
        all: ['banners'] as const,
        active: () => [...queryKeys.banners.all, 'active'] as const,
    },
    // User
    user: {
        all: ['user'] as const,
        addresses: () => [...queryKeys.user.all, 'addresses'] as const,
    },
} as const;
