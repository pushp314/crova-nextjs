import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { productSearch } from '@/ai/flows/product-search-flow';

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
    let searchTerms;
    try {
      searchTerms = await productSearch({ query });
    } catch (aiError) {
      console.error('AI search error, falling back to simple search:', aiError);
      searchTerms = { keywords: [query], categories: [] };
    }
    
    // Combine keywords into a single search string for 'contains'
    const searchString = searchTerms.keywords.join(' ');

    // Build where clause dynamically
    const whereClause: any = {
      AND: [
        {
          OR: [
            {
              name: {
                contains: searchString,
                mode: 'insensitive'
              },
            },
            {
              description: {
                contains: searchString,
                mode: 'insensitive'
              }
            },
            ...(searchTerms.categories.length > 0 ? [{
              category: {
                name: {
                  in: searchTerms.categories,
                  mode: 'insensitive'
                }
              }
            }] : [])
          ]
        }
      ]
    };

    // Add filters
    if (categoryId) {
      whereClause.AND.push({ categoryId });
    }

    if (minPrice) {
      whereClause.AND.push({ price: { gte: parseFloat(minPrice) } });
    }

    if (maxPrice) {
      whereClause.AND.push({ price: { lte: parseFloat(maxPrice) } });
    }

    if (inStock === 'true') {
      whereClause.AND.push({ stock: { gt: 0 } });
    }

    // Build order by clause
    let orderBy: any = {};
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
        include: {
            category: true
        },
        orderBy
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('GET /api/search Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
