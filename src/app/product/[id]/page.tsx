import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { generateProductMetadata, generateProductJsonLd } from '@/lib/seo';
import ProductDetailClient from '@/components/product/product-detail-client';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// Generate SEO metadata for product pages
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    });

    if (!product) {
      return {
        title: 'Product Not Found',
      };
    }

    // Use the first category for metadata if available
    const categoryName = product.categories.length > 0 ? product.categories[0].category.name : undefined;

    return generateProductMetadata({
      name: product.name,
      description: product.description,
      price: product.price,
      images: product.images,
      category: categoryName,
      id: product.id,
    });
  } catch {
    return {
      title: 'Product',
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      categories: {
        include: {
          category: true
        }
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          rating: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Calculate average rating
  const ratings = await prisma.rating.findMany({
    where: { productId: id },
  });

  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
      : 0;

  const productWithRating = {
    ...product,
    averageRating,
    sizes: product.sizes || [],
    colors: product.colors || [],
    featured: product.featured,
  };

  // Generate JSON-LD structured data for this product
  const productJsonLd = generateProductJsonLd({
    name: product.name,
    description: product.description,
    price: product.price,
    images: product.images,
    id: product.id,
    inStock: product.stock > 0,
    rating: averageRating > 0 ? averageRating : undefined,
    reviewCount: ratings.length > 0 ? ratings.length : undefined,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      {/* 
        Note: We probably need to update ProductDetailClient to display multiple categories. 
        For now, we pass the product object which contains 'categories'.
      */}
      <ProductDetailClient product={productWithRating} />
    </>
  );
}
