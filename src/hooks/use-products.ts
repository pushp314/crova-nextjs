'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import type { Product } from '@/lib/types';

// Types for API responses
interface ProductsResponse {
    products: Product[];
    total?: number;
}

interface ProductFilters extends Record<string, unknown> {
    categoryId?: string;
    featured?: boolean;
    limit?: number;
}

// Fetch functions
async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.featured !== undefined) params.set('featured', String(filters.featured));
    if (filters.limit) params.set('limit', String(filters.limit));

    const res = await fetch(`/api/products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
}

async function fetchProduct(id: string): Promise<Product> {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
}

// Hooks

/**
 * Fetch products with optional filtering
 */
export function useProducts(filters: ProductFilters = {}) {
    return useQuery({
        queryKey: queryKeys.products.list(filters),
        queryFn: () => fetchProducts(filters),
    });
}

/**
 * Fetch featured products (commonly used on homepage)
 */
export function useFeaturedProducts(limit = 4) {
    return useQuery({
        queryKey: queryKeys.products.featured(),
        queryFn: () => fetchProducts({ featured: true, limit }),
    });
}

/**
 * Fetch a single product by ID
 */
export function useProduct(id: string) {
    return useQuery({
        queryKey: queryKeys.products.detail(id),
        queryFn: () => fetchProduct(id),
        enabled: !!id,
    });
}

/**
 * Prefetch product data (useful for hover prefetching)
 */
export function usePrefetchProduct() {
    const queryClient = useQueryClient();

    return (id: string) => {
        queryClient.prefetchQuery({
            queryKey: queryKeys.products.detail(id),
            queryFn: () => fetchProduct(id),
            staleTime: 5 * 60 * 1000, // 5 minutes
        });
    };
}

/**
 * Fetch all categories
 */
export function useCategories() {
    return useQuery({
        queryKey: queryKeys.categories.all,
        queryFn: async () => {
            const res = await fetch('/api/categories');
            if (!res.ok) throw new Error('Failed to fetch categories');
            return res.json();
        },
        staleTime: 10 * 60 * 1000, // Categories change rarely, 10 min stale time
    });
}
