import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { updateOrderStatusSchema } from '@/lib/validations';
import { handleApiError } from '@/lib/api-error';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PUT /api/admin/orders/:id - Update order status (admin only)
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const { id } = await params;
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
    return handleApiError(error, 'PUT /api/admin/orders/[id]');
  }
}
