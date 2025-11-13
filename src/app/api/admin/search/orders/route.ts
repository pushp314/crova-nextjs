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
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const paymentMethod = searchParams.get('paymentMethod');

    // Build where clause
    const whereClause: any = {};

    if (query) {
      whereClause.OR = [
        {
          id: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          user: {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            email: {
              contains: query,
              mode: 'insensitive'
            }
          }
        },
        {
          paymentId: {
            contains: query,
            mode: 'insensitive'
          }
        }
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    if (paymentStatus) {
      whereClause.paymentStatus = paymentStatus;
    }

    if (paymentMethod) {
      whereClause.paymentMethod = paymentMethod;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true
              }
            }
          }
        },
        shippingAddress: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    console.error('GET /api/admin/search/orders Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
