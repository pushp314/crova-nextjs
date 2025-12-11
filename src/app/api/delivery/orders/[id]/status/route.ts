import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';
import { updateDeliveryStatusSchema } from '@/lib/validation/delivery';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { handleApiError, ApiError } from '@/lib/api-error';

interface RouteParams {
  params: Promise<{
    id: string; // Order ID
  }>;
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

    const { id } = await params;
    const body = await req.json();
    const { status, deliveryProofUrl } = updateDeliveryStatusSchema.parse(body);

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw ApiError.notFound('Order');
    }

    if (order.assignedToId !== activeSession.user.id) {
      throw ApiError.forbidden('You are not assigned to this order.');
    }

    const allowedTransitions = validTransitions[order.status];
    if (!allowedTransitions || !allowedTransitions.includes(status)) {
      throw ApiError.badRequest(`Invalid status transition from ${order.status} to ${status}.`);
    }

    const data: { status: OrderStatus; deliveryProofUrl?: string; paymentStatus?: PaymentStatus } = { status };
    if (deliveryProofUrl) {
      data.deliveryProofUrl = deliveryProofUrl;
    }

    if (status === OrderStatus.DELIVERED) {
      // Also update payment status for COD orders
      if (order.paymentMethod === 'cod') {
        data.paymentStatus = PaymentStatus.PAID;
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return handleApiError(error, 'POST /api/delivery/orders/[id]/status');
  }
}
