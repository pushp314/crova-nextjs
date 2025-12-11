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
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const paymentMethod = searchParams.get('paymentMethod');

    // Build where clause with proper Prisma types
    const whereClause: Prisma.OrderWhereInput = {};

    if (query) {
      whereClause.OR = [
        {
          id: {
            contains: query,
            mode: 'insensitive' as const
          }
        },
        {
          user: {
            name: {
              contains: query,
              mode: 'insensitive' as const
            }
          }
        },
        {
          user: {
            email: {
              contains: query,
              mode: 'insensitive' as const
            }
          }
        },
        {
          paymentId: {
            contains: query,
            mode: 'insensitive' as const
          }
        }
      ];
    }

    if (status) {
      whereClause.status = status as Prisma.EnumOrderStatusFilter;
    }

    if (paymentStatus) {
      whereClause.paymentStatus = paymentStatus as Prisma.EnumPaymentStatusFilter;
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
    return handleApiError(error, 'GET /api/admin/search/orders');
  }
}
