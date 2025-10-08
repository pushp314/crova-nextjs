
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/product/product-grid';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/products?featured=true&limit=4');
        if (!res.ok) throw new Error("Failed to fetch products");
        const products = await res.json();
        setFeaturedProducts(products);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <>
      <section className="relative h-[60vh] w-full text-white md:h-[80vh] -mx-4 sm:-mx-8 md:mx-0">
        {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center p-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Effortless Elegance
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4 max-w-xl text-lg md:text-xl"
          >
            Discover our new collection of timeless pieces.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button asChild className="mt-8" size="lg">
              <Link href="#featured-products">Shop Now</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-8 md:hidden">
        <div className="grid grid-cols-2 gap-4">
          <Link href="/women" passHref>
            <Card className="flex items-center justify-center p-6 aspect-video text-center font-semibold text-lg transition-all hover:bg-muted">
              Shop Women
            </Card>
          </Link>
          <Link href="/men" passHref>
            <Card className="flex items-center justify-center p-6 aspect-video text-center font-semibold text-lg transition-all hover:bg-muted">
              Shop Men
            </Card>
          </Link>
        </div>
      </section>

      <section id="featured-products" className="py-12 md:py-24">
        <h2 className="mb-8 text-center text-3xl font-bold md:mb-12 md:text-4xl">
          Featured Products
        </h2>
        {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-1/4 mx-auto" />
            </div>
            ))}
        </div>
        ) : (
        <ProductGrid products={featuredProducts} />
        )}
      </section>
    </>
  );
}
