import ProductGrid from '@/components/product/product-grid';
import { getProducts } from '@/lib/data';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Women\'s Collection - NOVA',
  description: 'Explore the latest fashion for women at NOVA.',
};

export default function WomenPage() {
  const allProducts = getProducts();
  const womenProducts = allProducts.filter(p => p.category === 'women');

  return (
    <div className="container py-12 md:py-24">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold">Women's Collection</h1>
        <p className="mt-2 text-muted-foreground">Shop the latest trends in women's fashion.</p>
      </header>
      <ProductGrid products={womenProducts} />
    </div>
  );
}
