
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/orders - get current user's order history
export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('GET /api/orders Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}


// POST /api/orders - create a new order from the user's cart
export async function POST() {
  try {
    const session = await getCurrentUser();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // 1. Get the user's cart
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

    // 2. Calculate total amount and check stock
    let totalAmount = 0;
    // Explicitly type the array to resolve TypeScript error
    const orderItemsData: { productId: string; quantity: number; price: number }[] = [];

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json({ message: `Not enough stock for ${item.product.name}. Available: ${item.product.stock}, Requested: ${item.quantity}` }, { status: 400 });
      }
      totalAmount += item.product.price * item.quantity;
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price, // Store price at time of purchase
      });
    }

    // 3. Use a transaction to ensure data integrity
    const newOrder = await prisma.$transaction(async (tx) => {
      // a. Create the Order and OrderItems
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: OrderStatus.PENDING,
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      // b. Update product stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // c. Clear the user's cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });

    return NextResponse.json(newOrder, { status: 201 });

  } catch (error) {
    console.error('POST /api/orders Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
