import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/product/product-grid';
import { getFeaturedProducts } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const featuredProducts = getFeaturedProducts();
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

  return (
    <div className="flex flex-col">
      <section className="relative h-[60vh] w-full text-white md:h-[80vh]">
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
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-bold md:text-6xl lg:text-7xl">
            Effortless Elegance
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl">
            Discover our new collection of timeless pieces.
          </p>
          <Button asChild className="mt-8" size="lg" variant="secondary">
            <Link href="#featured-products">Shop Now</Link>
          </Button>
        </div>
      </section>

      <section id="featured-products" className="py-12 md:py-24">
        <div className="container">
          <h2 className="mb-8 text-center text-3xl font-bold md:mb-12 md:text-4xl">
            Featured Products
          </h2>
          <ProductGrid products={featuredProducts} />
        </div>
      </section>
    </div>
  );
}
