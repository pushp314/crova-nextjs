import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { handleApiError, ApiError } from '@/lib/api-error';

interface RouteParams {
  params: Promise<{
    productId: string;
  }>;
}

// Remove item from wishlist
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    if (!session?.user.id) {
      throw ApiError.unauthorized();
    }

    const { productId } = await params;
    const userId = session.user.id;

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      throw ApiError.notFound('Wishlist');
    }

    const result = await prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
        productId: productId,
      },
    });

    if (result.count === 0) {
      throw ApiError.notFound('Product in wishlist');
    }

    return NextResponse.json({ message: 'Item removed from wishlist.' }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'DELETE /api/wishlist/[productId]');
  }
}
