import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { handleApiError, ApiError } from '@/lib/api-error';

interface RouteParams {
  params: Promise<{
    productId: string;
  }>;
}

// Remove item from cart
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    if (!session?.user.id) {
      throw ApiError.unauthorized();
    }

    const { productId } = await params;
    const userId = session.user.id;

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw ApiError.notFound('Cart');
    }

    const result = await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId: productId,
      },
    });

    if (result.count === 0) {
      throw ApiError.notFound('Product in cart');
    }

    return NextResponse.json({ message: 'Item removed from cart.' }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'DELETE /api/cart/[productId]');
  }
}
