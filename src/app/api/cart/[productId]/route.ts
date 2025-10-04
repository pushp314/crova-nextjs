import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: {
    productId: string;
  };
}

// Remove item from cart
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    if (!session?.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const { productId } = params;
    const userId = session.user.id;

    const cart = await prisma.cart.findUnique({
        where: { userId },
    });

    if (!cart) {
        return NextResponse.json({ message: 'Cart not found.' }, { status: 404 });
    }

    const result = await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId: productId,
      },
    });

    if (result.count === 0) {
        return NextResponse.json({ message: 'Product not found in cart.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Item removed from cart.' }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/cart/${params.productId} Error:`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
