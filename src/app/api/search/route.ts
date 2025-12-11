import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { productSearch } from '@/ai/flows/product-search-flow';
import { Prisma } from '@prisma/client';
import { handleApiError } from '@/lib/api-error';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const categoryId = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const inStock = searchParams.get('inStock');

    if (!query) {
      return NextResponse.json({ message: 'Query parameter is required' }, { status: 400 });
    }

    // Use AI to get structured search terms
    let searchTerms: { keywords: string[]; categories: string[] };
    try {
      searchTerms = await productSearch({ query });
    } catch {
      // AI search error, fall back to simple search
      searchTerms = { keywords: [query], categories: [] };
    }

    // Combine keywords into a single search string for 'contains'
    const searchString = searchTerms.keywords.join(' ');

    // Build where clause dynamically with proper Prisma types
    const andConditions: Prisma.ProductWhereInput[] = [
      {
        OR: [
          {
            name: {
              contains: searchString,
              mode: 'insensitive' as const
            },
          },
          {
            description: {
              contains: searchString,
              mode: 'insensitive' as const
            }
          }
        ]
      }
    ];

    // Add filters
    if (categoryId) {
      andConditions.push({ categoryId });
    }

    if (minPrice) {
      andConditions.push({ price: { gte: parseFloat(minPrice) } });
    }

    if (maxPrice) {
      andConditions.push({ price: { lte: parseFloat(maxPrice) } });
    }

    if (inStock === 'true') {
      andConditions.push({ stock: { gt: 0 } });
    }

    const whereClause: Prisma.ProductWhereInput = {
      AND: andConditions
    };

    // Build order by clause with proper Prisma types
    let orderBy: Prisma.ProductOrderByWithRelationInput;
    switch (sortBy) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy
    });

    return NextResponse.json(products);
  } catch (error) {
    return handleApiError(error, 'GET /api/search');
  }
}
