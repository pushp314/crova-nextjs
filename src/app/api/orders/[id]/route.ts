import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/orders/:id - get single order details
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    if (!session?.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

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
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    // Check if the user is an admin or the owner of the order
    if (session.user.role !== UserRole.ADMIN && order.userId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error(`GET /api/orders/${params.id} Error:`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
