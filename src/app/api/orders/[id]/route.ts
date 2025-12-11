import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { handleApiError, ApiError } from '@/lib/api-error';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/orders/:id - get single order details
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    if (!session?.user.id) {
      throw ApiError.unauthorized();
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        shippingAddress: true,
      },
    });

    if (!order) {
      throw ApiError.notFound('Order');
    }

    // Check if the user is an admin or the owner of the order
    if (session.user.role !== UserRole.ADMIN && order.userId !== session.user.id) {
      throw ApiError.forbidden();
    }

    return NextResponse.json(order);
  } catch (error) {
    return handleApiError(error, 'GET /api/orders/[id]');
  }
}
