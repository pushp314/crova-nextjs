
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Scissors } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/product/product-grid';
import VideoCarousel from '@/components/product/video-carousel';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

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
      {/* Hero Section with Fullscreen Video - Edge to Edge */}
      <section className="relative h-screen w-screen text-white" style={{ marginLeft: 'calc(50% - 50vw)', marginTop: 'calc(-1 * (4rem + var(--banner-height, 0px)))', width: '100vw', maxWidth: '100vw' }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/assets/hero/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl"
          >
            Because your story deserves more than a print
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Button asChild size="lg" className="text-base">
              <Link href="#featured-products">
                <Sparkles className="mr-2 h-5 w-5" />
                Shop Now
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base bg-white/10 hover:bg-white/20 text-white border-white">
              <Link href="/custom">
                <Scissors className="mr-2 h-5 w-5" />
                Customize Yours
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Featured Section - New Drops */}
      <section id="featured-products" className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold md:text-5xl mb-4">
              New Drops.
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
              Handpicked colors, bold threads, and embroidered stories — made for the ones who dare to stand out.
            </p>
          </motion.div>
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
        </div>
      </section>

      {/* Our Promise Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold md:text-4xl mb-6">Our Promise</h2>
            <p className="text-lg md:text-xl leading-relaxed text-muted-foreground mb-4">
              Every Crova tee is crafted with precision embroidery, long-lasting comfort, and 100% cotton fabric.
            </p>
            <p className="text-xl md:text-2xl font-semibold">
              No mass production. Just timeless pieces.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Customer Highlight */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="border-2">
              <CardContent className="pt-12 pb-12 text-center">
                <Heart className="h-12 w-12 mx-auto mb-6 text-primary" />
                <blockquote className="text-2xl md:text-3xl font-medium mb-6 leading-relaxed">
                  "It's not just a T-shirt — it's a feeling I wear."
                </blockquote>
                <p className="text-muted-foreground text-lg">— A Crova Customer</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Men's & Women's Edit */}
      <section className="py-16 md:py-24 bg-muted/20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Link href="/men" className="group block">
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[4/5] relative">
                    <Image
                      src="/assets/collections/mens-collection.jpg"
                      alt="Men's Collection"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-8 text-white">
                        <h3 className="text-3xl md:text-4xl font-bold mb-3">Men's Edit</h3>
                        <p className="text-lg">Classic fits with subtle boldness.</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6 text-center">
                    <Button variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Explore Collection
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Link href="/women" className="group block">
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[4/5] relative">
                    <Image
                      src="/assets/collections/womens-collection.jpg"
                      alt="Women's Collection"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-8 text-white">
                        <h3 className="text-3xl md:text-4xl font-bold mb-3">Women's Edit</h3>
                        <p className="text-lg">Soft hues, strong statements.</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6 text-center">
                    <Button variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Explore Collection
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* See CROVA In Motion - Video Carousel */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left - Video Carousel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <VideoCarousel />
            </motion.div>

            {/* Right - Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h2 className="text-3xl font-bold md:text-5xl lg:text-6xl mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    See CROVA In Motion
                  </h2>
                  <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                    Experience the craftsmanship, quality, and style that makes every piece unique.
                  </p>
                </motion.div>
              </div>

              <div className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1.5">Precision Embroidery</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Every stitch crafted with care, bringing your design to life with intricate detail.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1.5">Premium Fabrics</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      100% cotton comfort meets durability. Soft, breathable, built to last.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Scissors className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1.5">Unique Designs</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      No mass production. Each piece thoughtfully designed to stand out.
                    </p>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="pt-2"
              >
                <Button asChild size="lg" className="text-base">
                  <Link href="/products">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Explore Collection
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Custom Your Tee Section */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Scissors className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl font-bold md:text-5xl mb-6">Custom Your Tee</h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Upload your idea → We embroider it → You wear your art.
            </p>
            <Button asChild size="lg" className="text-base">
              <Link href="/custom">
                Start Creating
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
