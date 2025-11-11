
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/rbac';

// GET /api/admin/orders - Get all orders (admin only)
export async function GET(req: Request) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const orders = await prisma.order.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
          }
        },
        items: {
            include: {
                product: {
                    select: {
                        name: true,
                        images: true,
                    }
                }
            }
        },
        shippingAddress: true,
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
    console.error('GET /api/admin/orders Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
