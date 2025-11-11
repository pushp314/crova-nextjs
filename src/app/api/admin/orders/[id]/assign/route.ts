
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';
import { assignOrderSchema } from '@/lib/validation/delivery';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

interface RouteParams {
  params: {
    id: string; // Order ID
  };
}

// POST /api/admin/orders/:id/assign
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const body = await req.json();
    const { assignedToId } = assignOrderSchema.parse(body);

    if (assignedToId === 'unassign') {
       const updatedOrder = await prisma.order.update({
        where: { id: params.id },
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
      return NextResponse.json({ message: 'The selected user is not a delivery person.' }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { assignedToId },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
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
    console.error(`[ORDER_ASSIGN_${params.id}]`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
