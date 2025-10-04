import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Clear all items from the cart
export async function DELETE() {
  try {
    const session = await getCurrentUser();
    if (!session?.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!cart) {
      return NextResponse.json({ message: 'Cart not found.' }, { status: 404 });
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return NextResponse.json({ message: 'Cart cleared successfully.' }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/cart/clear Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
