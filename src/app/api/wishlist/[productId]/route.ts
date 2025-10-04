import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    productId: string;
  };
}

// Remove item from wishlist
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    if (!session?.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const { productId } = params;
    const userId = session.user.id;

    const wishlist = await prisma.wishlist.findUnique({
        where: { userId },
    });

    if (!wishlist) {
        return NextResponse.json({ message: 'Wishlist not found.' }, { status: 404 });
    }

    const result = await prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
        productId: productId,
      },
    });
    
    if (result.count === 0) {
        return NextResponse.json({ message: 'Product not found in wishlist.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Item removed from wishlist.' }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/wishlist/${params.productId} Error:`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
