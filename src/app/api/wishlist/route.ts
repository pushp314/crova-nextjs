import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { wishlistItemSchema } from '@/lib/validations';
import { z } from 'zod';

// Get current user's wishlist
export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session?.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const wishlist = await prisma.wishlist.findUnique({
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
      },
    });

    if (!wishlist) {
      // If no wishlist, return an empty one
       return NextResponse.json({ items: [], _count: { items: 0 } });
    }

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error('GET /api/wishlist Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// Add an item to the wishlist
export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session?.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { productId } = wishlistItemSchema.parse(body);
    const userId = session.user.id;

    const updatedWishlist = await prisma.$transaction(async (tx) => {
      let wishlist = await tx.wishlist.findUnique({
        where: { userId },
      });

      if (!wishlist) {
        wishlist = await tx.wishlist.create({
          data: { userId },
        });
      }

      const existingItem = await tx.wishlistItem.findFirst({
        where: { wishlistId: wishlist.id, productId },
      });

      if (!existingItem) {
        await tx.wishlistItem.create({
          data: {
            wishlistId: wishlist.id,
            productId,
          },
        });
      }

      return tx.wishlist.findUnique({
        where: { id: wishlist.id },
        include: { items: { include: { product: true } } },
      });
    });

    return NextResponse.json(updatedWishlist, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    console.error('POST /api/wishlist Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
