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

    // Check stock before creating order
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json({ message: `Not enough stock for ${item.product.name}. Available: ${item.product.stock}, Requested: ${item.quantity}` }, { status: 400 });
      }
    }

    const totalAmount = cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);

    const payment_capture = 1;
    const amountInPaise = Math.round(totalAmount * 100);
    const currency = 'INR'; 

    const options = {
      amount: amountInPaise,
      currency,
      receipt: shortid.generate(),
      payment_capture,
    };

    const response = await razorpay.orders.create(options);

    // Create a PENDING order in the database which will be updated by the webhook
    await prisma.order.create({
        data: {
            userId: session.user.id,
            totalAmount: totalAmount,
            status: 'PENDING',
            paymentMethod: 'razorpay',
            paymentStatus: 'PENDING',
            paymentId: response.id, // Store Razorpay order_id here initially
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
