import { notFound } from 'next/navigation';
import { getProductById, getProducts } from '@/lib/data';
import ProductDetailClient from '@/components/product/product-detail-client';
import { Metadata } from 'next';

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProductById(params.id);

  if (!product) {
    return {
      title: "Product Not Found"
    }
  }

  return {
    title: `${product.name} - NOVA`,
    description: product.description.substring(0, 150)
  }
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = getProductById(params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}

export async function generateStaticParams() {
  const products = getProducts();
  return products.map((product) => ({
    id: product.id,
  }));
}
