'use client';

import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/data';
import ProductDetailClient from '@/components/product/product-detail-client';

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = getProductById(params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
