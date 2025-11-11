
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';

// GET /api/delivery/orders
export async function GET() {
  try {
    const session = await getCurrentUser();
    const activeSession = requireRole(session, ['DELIVERY', 'ADMIN']); // Also allow admin to see for debug

    const orders = await prisma.order.findMany({
      where: {
        assignedToId: activeSession.user.id,
      },
      include: {
        user: { select: { name: true, email: true } },
        shippingAddress: true,
        items: {
          include: {
            product: {
              select: { name: true, images: true }
            }
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    console.error('[DELIVERY_ORDERS_GET]', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
