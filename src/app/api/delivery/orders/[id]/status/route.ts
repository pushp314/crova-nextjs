
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';
import { updateDeliveryStatusSchema } from '@/lib/validation/delivery';
import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

interface RouteParams {
  params: {
    id: string; // Order ID
  };
}

const validTransitions: { [key in OrderStatus]?: OrderStatus[] } = {
  [OrderStatus.PROCESSING]: [OrderStatus.OUT_FOR_DELIVERY],
  [OrderStatus.SHIPPED]: [OrderStatus.OUT_FOR_DELIVERY],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.DELIVERY_FAILED],
};

// POST /api/delivery/orders/:id/status
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    const activeSession = requireRole(session, ['DELIVERY']);

    const body = await req.json();
    const { status, deliveryProofUrl } = updateDeliveryStatusSchema.parse(body);

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    if (order.assignedToId !== activeSession.user.id) {
      return NextResponse.json({ message: 'You are not assigned to this order.' }, { status: 403 });
    }

    const allowedTransitions = validTransitions[order.status];
    if (!allowedTransitions || !allowedTransitions.includes(status)) {
      return NextResponse.json({ message: `Invalid status transition from ${order.status} to ${status}.` }, { status: 400 });
    }

    const data: { status: OrderStatus; deliveryProofUrl?: string } = { status };
    if (deliveryProofUrl) {
      data.deliveryProofUrl = deliveryProofUrl;
    }
    
    if (status === OrderStatus.DELIVERED) {
        // Also update payment status for COD orders
        if (order.paymentMethod === 'cod') {
           (data as any).paymentStatus = 'PAID';
        }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updatedOrder);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    console.error(`[DELIVERY_STATUS_UPDATE_${params.id}]`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
