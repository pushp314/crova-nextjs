
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import ProductGrid from '@/components/product/product-grid';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/lib/types';
import { SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const LoadingSkeleton = () => (
  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="aspect-[3/4] w-full" />
        <Skeleton className="h-6 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/4 mx-auto" />
      </div>
    ))}
  </div>
);

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState(query);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!query) {
        setProducts([]);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Failed to fetch search results", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [query]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(`/search?q=${encodeURIComponent(currentQuery)}`);
  };

  return (
    <div className="py-12 md:py-16">
       <header className="mb-8 md:mb-12">
        <h1 className="text-3xl font-bold md:text-4xl text-center">Search</h1>
        <form onSubmit={handleSearch} className="mt-6 max-w-lg mx-auto flex gap-2">
          <Input 
            type="search"
            value={currentQuery}
            onChange={(e) => setCurrentQuery(e.target.value)}
            placeholder="e.g. 'blue shirt for men'"
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading}>
            <SearchIcon className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        </form>
      </header>

      {isLoading ? (
        <LoadingSkeleton />
      ) : products.length > 0 ? (
        <>
            <p className="text-center text-muted-foreground mb-8">
                Showing {products.length} results for &quot;{query}&quot;
            </p>
            <ProductGrid products={products} />
        </>
      ) : (
        <div className="text-center py-16">
            <SearchIcon className="mx-auto h-24 w-24 text-muted-foreground" />
            <h2 className="mt-4 text-2xl font-semibold">
                {query ? 'No products found' : 'Search for products'}
            </h2>
            <p className="mt-2 text-muted-foreground">
                {query 
                    ? `We couldn't find anything for "${query}". Try a different search.`
                    : 'Use the search bar above to find products by name, description, or category.'
                }
            </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<LoadingSkeleton />}>
            <SearchPageContent />
        </Suspense>
    )
}
