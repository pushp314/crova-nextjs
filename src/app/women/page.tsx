'use client';

import ProductGrid from '@/components/product/product-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function WomenPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // In a real app, the API would support filtering by category slug "women"
        // For now, we fetch all and filter client-side
        const res = await fetch('/api/categories');
        const categories = await res.json();
        const womenCategory = categories.find((c: any) => c.name.toLowerCase() === 'women');

        if (womenCategory) {
          const productRes = await fetch(`/api/products?categoryId=${womenCategory.id}`);
          const womenProducts = await productRes.json();
          setProducts(womenProducts);
        }
      } catch (error) {
        console.error("Failed to fetch women's products", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="container py-12 md:py-24">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold">Women's Collection</h1>
        <p className="mt-2 text-muted-foreground">Shop the latest trends in women's fashion.</p>
      </header>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="h-6 w-3/4 mx-auto" />
              <Skeleton className="h-6 w-1/4 mx-auto" />
            </div>
          ))}
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
