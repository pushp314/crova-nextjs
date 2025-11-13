import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';

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

    // Build where clause
    const whereClause: any = {};

    if (query) {
      whereClause.OR = [
        {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          category: {
            name: {
              contains: query,
              mode: 'insensitive'
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

    if (minPrice) {
      whereClause.price = { ...whereClause.price, gte: parseFloat(minPrice) };
    }

    if (maxPrice) {
      whereClause.price = { ...whereClause.price, lte: parseFloat(maxPrice) };
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
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    console.error('GET /api/admin/search/products Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
