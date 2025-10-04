import ProductGrid from '@/components/product/product-grid';
import { getProducts } from '@/lib/data';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Men\'s Collection - NOVA',
  description: 'Explore the latest fashion for men at NOVA.',
};

export default function MenPage() {
  const allProducts = getProducts();
  const menProducts = allProducts.filter(p => p.category === 'men');

  return (
    <div className="container py-12 md:py-24">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold">Men's Collection</h1>
        <p className="mt-2 text-muted-foreground">Discover our curated selection of modern menswear.</p>
      </header>
      <ProductGrid products={menProducts} />
    </div>
  );
}
