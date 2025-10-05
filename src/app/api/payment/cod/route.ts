
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { z } from 'zod';

const codOrderSchema = z.object({
  addressId: z.string().min(1, 'Address ID is required.'),
});

// POST /api/payment/cod - create a new order with Cash on Delivery
export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session?.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const { addressId } = codOrderSchema.parse(body);

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ message: 'Cannot create order from an empty cart.' }, { status: 400 });
    }

    let totalAmount = 0;
    const orderItemsData: { productId: string; quantity: number; price: number }[] = [];

    // Use a transaction to check stock and create order atomically
    const newOrder = await prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stock < item.quantity) {
          throw new Error(`Not enough stock for ${item.product.name}. Available: ${product?.stock || 0}, Requested: ${item.quantity}`);
        }
        totalAmount += item.product.price * item.quantity;
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        });
      }

      // Create the order
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: OrderStatus.PROCESSING, // Or PENDING, depending on business logic
          paymentMethod: 'cod',
          paymentStatus: PaymentStatus.PENDING,
          shippingAddressId: addressId,
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true, shippingAddress: true },
      });

      // Decrement stock for each item
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Clear the user's cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });

    return NextResponse.json(newOrder, { status: 201 });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    console.error('POST /api/payment/cod Error:', error);
    // Check if the error is due to insufficient stock from our custom error
    if (error.message.includes('Not enough stock')) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
