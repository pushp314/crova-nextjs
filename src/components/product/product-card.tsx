
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import type { Product } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { getProductImageUrl } from '@/lib/image-helper';
import SafeImage from '@/components/ui/safe-image';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = getProductImageUrl(product.images[0]);
  const placeholder = PlaceHolderImages.find(p => p.imageUrl === product.images[0]);
  const imageHint = placeholder ? placeholder.imageHint : 'fashion product';

  return (
    <Link href={`/product/${product.id}`} passHref>
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        className="h-full group"
      >
        <Card className="h-full overflow-hidden border-none bg-transparent shadow-none transition-shadow duration-300 group-hover:shadow-xl rounded-lg">
          <div className="relative aspect-[3/4] w-full overflow-hidden">
            <SafeImage
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              data-ai-hint={imageHint}
            />
          </div>
          <div className="p-2 text-center md:p-4">
            <h3 className="text-sm font-medium md:text-base truncate">{product.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground md:text-base">
              ₹{product.price.toFixed(2)}
            </p>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}
