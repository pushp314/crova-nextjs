import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';
import { Prisma } from '@prisma/client';
import { handleApiError } from '@/lib/api-error';

export async function GET(req: Request) {
  try {
    // Authenticate and authorize
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const categoryId = searchParams.get('category');
    const featured = searchParams.get('featured');
    const inStock = searchParams.get('inStock');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // Build where clause with proper Prisma types
    const whereClause: Prisma.ProductWhereInput = {};

    if (query) {
      whereClause.OR = [
        {
          name: {
            contains: query,
            mode: 'insensitive' as const
          }
        },
        {
          description: {
            contains: query,
            mode: 'insensitive' as const
          }
        },
        {
          category: {
            name: {
              contains: query,
              mode: 'insensitive' as const
            }
          }
        }
      ];
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (featured === 'true') {
      whereClause.featured = true;
    } else if (featured === 'false') {
      whereClause.featured = false;
    }

    if (inStock === 'true') {
      whereClause.stock = { gt: 0 };
    } else if (inStock === 'false') {
      whereClause.stock = 0;
    }

    // Build price filter
    let priceFilter: Prisma.FloatFilter | undefined;
    if (minPrice) {
      priceFilter = { ...priceFilter, gte: parseFloat(minPrice) };
    }
    if (maxPrice) {
      priceFilter = { ...priceFilter, lte: parseFloat(maxPrice) };
    }
    if (priceFilter) {
      whereClause.price = priceFilter;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/search/products');
  }
}
