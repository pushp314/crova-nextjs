import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Razorpay from 'razorpay';
import shortid from 'shortid';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
    }

    const totalAmount = cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);

    const payment_capture = 1;
    const amountInPaise = Math.round(totalAmount * 100);
    const currency = 'INR'; // Change if you use a different currency

    const options = {
      amount: amountInPaise,
      currency,
      receipt: shortid.generate(),
      payment_capture,
    };

    const response = await razorpay.orders.create(options);

    // Create a PENDING order in the database
    await prisma.order.create({
        data: {
            userId: session.user.id,
            totalAmount: totalAmount,
            status: 'PENDING',
            paymentMethod: 'razorpay',
            paymentStatus: 'PENDING',
            paymentId: response.id, // Store Razorpay order_id
            items: {
                create: cart.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.product.price,
                }))
            }
        }
    });

    return NextResponse.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    console.error('POST /api/payment/razorpay Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
