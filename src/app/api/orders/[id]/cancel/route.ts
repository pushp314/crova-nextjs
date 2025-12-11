import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { OrderStatus, UserRole } from '@prisma/client';
import { handleApiError, ApiError } from '@/lib/api-error';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PUT /api/orders/:id/cancel - cancel an order
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    if (!session?.user.id) {
      throw ApiError.unauthorized();
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw ApiError.notFound('Order');
    }

    // Allow cancellation only by the owner or an admin
    if (order.userId !== session.user.id && session.user.role !== UserRole.ADMIN) {
      throw ApiError.forbidden();
    }

    // Only allow cancellation if the order is still pending
    if (order.status !== OrderStatus.PENDING) {
      throw ApiError.badRequest(`Cannot cancel order with status ${order.status}.`);
    }

    // Use a transaction to restore stock and update order status
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      const orderToCancel = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!orderToCancel) throw new Error("Order not found during transaction.");

      // Restore product stock
      for (const item of orderToCancel.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // Update the order status
      return tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
      });
    });

    return NextResponse.json(cancelledOrder);
  } catch (error) {
    return handleApiError(error, 'PUT /api/orders/[id]/cancel');
  }
}
