import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { productSearch } from '@/ai/flows/product-search-flow';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ message: 'Query parameter is required' }, { status: 400 });
    }

    // Use AI to get structured search terms
    const searchTerms = await productSearch({ query });

    const products = await prisma.product.findMany({
        where: {
            OR: [
                {
                    name: {
                        search: searchTerms.keywords.join(' | '),
                        mode: 'insensitive'
                    },
                },
                {
                    description: {
                        search: searchTerms.keywords.join(' | '),
                         mode: 'insensitive'
                    }
                },
                {
                    category: {
                        name: {
                            in: searchTerms.categories,
                             mode: 'insensitive'
                        }
                    }
                }
            ]
        },
        include: {
            category: true
        }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('GET /api/search Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
