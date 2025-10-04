import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { PaymentStatus } from '@prisma/client';

const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const text = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  if (!signature) {
    return NextResponse.json({ message: 'Signature missing' }, { status: 400 });
  }

  const generated_signature = crypto
    .createHmac('sha256', razorpayWebhookSecret)
    .update(text)
    .digest('hex');

  if (generated_signature !== signature) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
  }

  const body = JSON.parse(text);
  const event = body.event;
  
  try {
    if (event === 'payment.captured') {
      const payment = body.payload.payment.entity;
      const orderId = payment.order_id;
      
      const order = await prisma.order.findFirst({
        where: { paymentId: orderId },
        include: { items: true },
      });

      if (order && order.paymentStatus !== 'PAID') {
         // Use a transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // 1. Update order status to PAID
            await tx.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: PaymentStatus.PAID,
                paymentId: payment.id, // Can update with payment_id
              },
            });

            // 2. Decrement stock
            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
            }

            // 3. Clear the user's cart
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
        const orderId = payment.order_id;
        
        await prisma.order.updateMany({
            where: { paymentId: orderId },
            data: {
                paymentStatus: PaymentStatus.FAILED
            }
        });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
