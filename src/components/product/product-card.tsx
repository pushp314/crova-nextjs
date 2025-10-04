import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import type { Product } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
    const placeholder = PlaceHolderImages.find(p => p.imageUrl === product.images[0]);
    const imageHint = placeholder ? placeholder.imageHint : 'fashion product';

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="overflow-hidden border-none bg-transparent shadow-none transition-shadow duration-300 hover:shadow-lg">
        <div className="relative aspect-[3/4] w-full">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            data-ai-hint={imageHint}
          />
        </div>
        <div className="p-2 text-center md:p-4">
          <h3 className="text-sm font-medium md:text-base">{product.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            ${product.price.toFixed(2)}
          </p>
        </div>
      </Card>
    </Link>
  );
}
