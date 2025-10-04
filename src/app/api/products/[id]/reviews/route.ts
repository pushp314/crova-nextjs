import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

const reviewSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  comment: z.string().min(10, 'Comment must be at least 10 characters long.'),
  rating: z.coerce.number().int().min(1).max(5),
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/products/:id/reviews
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        productId: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        rating: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error(`GET /api/products/${params.id}/reviews Error:`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST /api/products/:id/reviews
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, comment, rating } = reviewSchema.parse(body);

    const userId = session.user.id;
    const productId = params.id;

    // 1. Check if user has purchased this product
    const hasPurchased = await prisma.order.findFirst({
        where: {
            userId: userId,
            paymentStatus: 'PAID',
            items: {
                some: {
                    productId: productId,
                }
            }
        }
    });

    if (!hasPurchased) {
        return NextResponse.json({ message: 'You can only review products you have purchased.' }, { status: 403 });
    }

    // 2. Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
        where: {
            userId: userId,
            productId: productId,
        }
    });

    if (existingReview) {
        return NextResponse.json({ message: 'You have already reviewed this product.' }, { status: 409 });
    }
    
    // 3. Create the review and rating in a transaction
    const newReview = await prisma.$transaction(async (tx) => {
        const review = await tx.review.create({
            data: {
                title,
                comment,
                productId,
                userId,
            }
        });

        await tx.rating.create({
            data: {
                value: rating,
                productId,
                userId,
                reviewId: review.id,
            }
        });
        
        // Return the full review with user and rating
        return tx.review.findUnique({
            where: { id: review.id },
            include: {
                user: { select: { id: true, name: true, image: true } },
                rating: true,
            }
        });
    });


    return NextResponse.json(newReview, { status: 201 });

  } catch (error) {
     if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    console.error('POST /api/products/[id]/reviews Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
