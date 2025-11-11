
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { updateOrderStatusSchema } from '@/lib/validations';
import { z } from 'zod';

interface RouteParams {
  params: {
    id: string;
  };
}

// PUT /api/admin/orders/:id - Update order status (admin only)
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const { id } = params;
    const body = await req.json();
    const { status } = updateOrderStatusSchema.parse(body);

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: { select: { name: true, images: true } } } },
        shippingAddress: true,
      }
    });

    return NextResponse.json(updatedOrder);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }
    console.error(`PUT /api/admin/orders/${params.id} Error:`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
