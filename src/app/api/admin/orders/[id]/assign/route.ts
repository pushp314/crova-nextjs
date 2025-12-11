import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';
import { assignOrderSchema } from '@/lib/validation/delivery';
import { UserRole } from '@prisma/client';
import { handleApiError, ApiError } from '@/lib/api-error';

interface RouteParams {
  params: Promise<{
    id: string; // Order ID
  }>;
}

// POST /api/admin/orders/:id/assign
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const { id } = await params;
    const body = await req.json();
    const { assignedToId } = assignOrderSchema.parse(body);

    if (assignedToId === 'unassign') {
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { assignedToId: null },
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      return NextResponse.json(updatedOrder);
    }

    const deliveryUser = await prisma.user.findUnique({
      where: { id: assignedToId },
    });

    if (!deliveryUser || deliveryUser.role !== UserRole.DELIVERY) {
      throw ApiError.badRequest('The selected user is not a delivery person.');
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { assignedToId },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/orders/[id]/assign');
  }
}
