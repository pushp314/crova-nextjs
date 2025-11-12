'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import ProductGrid from '@/components/product/product-grid';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=12');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="container py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">New Arrivals</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Fresh off our embroidery machine — discover the latest drops from Crova Studio.
        </p>
      </div>

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
      ) : products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No new arrivals at the moment. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
