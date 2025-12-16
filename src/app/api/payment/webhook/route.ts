import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { OrderStatus, PaymentStatus } from '@prisma/client';

const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const text = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  if (!signature) {
    console.error('Razorpay Webhook: Signature missing');
    return NextResponse.json({ message: 'Signature missing' }, { status: 400 });
  }

  const generated_signature = crypto
    .createHmac('sha256', razorpayWebhookSecret)
    .update(text)
    .digest('hex');

  if (generated_signature !== signature) {
    console.error('Razorpay Webhook: Invalid signature');
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
  }

  const body = JSON.parse(text);
  const event = body.event;

  try {
    if (event === 'payment.captured') {
      const payment = body.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      const order = await prisma.order.findFirst({
        where: { paymentId: razorpayOrderId }, // Find order by Razorpay order_id
        include: { items: true },
      });

      if (order && order.paymentStatus !== PaymentStatus.PAID) {
        await prisma.$transaction(async (tx) => {
          // 1. Update order status
          await tx.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: PaymentStatus.PAID,
              status: OrderStatus.PROCESSING,
              paymentId: payment.id, // Now store the actual payment_id
            },
          });

          // Stock was already decremented at order creation (POST /api/orders). 
          // We DO NOT decrement again here.

          // 2. Clear the user's cart (redundant safety check, usually cleared at creation but good to ensure)
          const userCart = await tx.cart.findUnique({
            where: { userId: order.userId }
          });
          if (userCart) {
            await tx.cartItem.deleteMany({
              where: { cartId: userCart.id }
            });
          }
        });
      }
    } else if (event === 'payment.failed') {
      const payment = body.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      const order = await prisma.order.findFirst({
        where: { paymentId: razorpayOrderId },
        include: { items: true },
      });

      if (order && order.status === OrderStatus.PENDING) {
        await prisma.$transaction(async (tx) => {
          // 1. Mark order as cancelled/failed
          await tx.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: PaymentStatus.FAILED,
              status: OrderStatus.CANCELLED,
            },
          });

          // 2. RESTORE STOCK (Critical Fix)
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        });
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Razorpay Webhook processing error:', error);
    return NextResponse.json({ message: 'Internal server error while processing webhook' }, { status: 500 });
  }
}
