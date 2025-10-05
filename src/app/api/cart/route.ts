import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { cartItemSchema } from '@/lib/validations';
import { z } from 'zod';

// Get current user's cart
export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session?.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: {
            createdAt: 'asc',
          }
        },
        _count: {
          select: { items: true }
        }
      },
    });

    if (!cart) {
       // If no cart, return an empty one
       return NextResponse.json({ id: null, userId: session.user.id, items: [], _count: { items: 0 } });
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error('GET /api/cart Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// Add an item to the cart
export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session?.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, quantity } = cartItemSchema.parse(body);

    const userId = session.user.id;

    const updatedCart = await prisma.$transaction(async (tx) => {
      let cart = await tx.cart.findUnique({
        where: { userId },
      });

      if (!cart) {
        cart = await tx.cart.create({
          data: { userId },
        });
      }

      const existingItem = await tx.cartItem.findFirst({
        where: { cartId: cart.id, productId },
      });

      if (existingItem) {
        // Update quantity if item exists
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        });
      } else {
        // Create new cart item
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
          },
        });
      }

      return tx.cart.findUnique({
        where: { id: cart.id },
        include: { items: { include: { product: true } }, _count: { select: {items: true}} },
      });
    });

    return NextResponse.json(updatedCart, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    console.error('POST /api/cart Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// Update item quantity in cart
export async function PUT(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session?.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, quantity } = cartItemSchema.parse(body);

    const cart = await prisma.cart.findUnique({
        where: { userId: session.user.id },
    });

    if (!cart) {
        return NextResponse.json({ message: 'Cart not found.' }, { status: 404 });
    }

    const updatedItem = await prisma.cartItem.updateMany({
        where: { cartId: cart.id, productId: productId },
        data: { quantity: quantity }
    });

    if (updatedItem.count === 0) {
        return NextResponse.json({ message: 'Product not found in cart.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Cart updated successfully.' }, { status: 200 });

  } catch (error) {
     if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    console.error('PUT /api/cart Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
