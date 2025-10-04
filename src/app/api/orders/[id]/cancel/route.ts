import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { OrderStatus, UserRole } from '@prisma/client';

interface RouteParams {
  params: {
    id: string;
  };
}

// PUT /api/orders/:id/cancel - cancel an order
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    if (!session?.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    // Allow cancellation only by the owner or an admin
    if (order.userId !== session.user.id && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Only allow cancellation if the order is still pending
    if (order.status !== OrderStatus.PENDING) {
      return NextResponse.json({ message: `Cannot cancel order with status ${order.status}.` }, { status: 400 });
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
     if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
     }
    console.error(`PUT /api/orders/${params.id}/cancel Error:`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
