import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { handleApiError, ApiError } from '@/lib/api-error';

const reviewSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  comment: z.string().min(10, 'Comment must be at least 10 characters long.'),
  rating: z.coerce.number().int().min(1).max(5),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/products/:id/reviews
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const reviews = await prisma.review.findMany({
      where: {
        productId: id,
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
    return handleApiError(error, 'GET /api/products/[id]/reviews');
  }
}

// POST /api/products/:id/reviews
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    if (!session?.user?.id) {
      throw ApiError.unauthorized();
    }

    const { id: productId } = await params;
    const body = await req.json();
    const { title, comment, rating } = reviewSchema.parse(body);

    const userId = session.user.id;

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
      throw ApiError.forbidden('You can only review products you have purchased.');
    }

    // 2. Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: userId,
        productId: productId,
      }
    });

    if (existingReview) {
      throw ApiError.conflict('You have already reviewed this product.');
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
    return handleApiError(error, 'POST /api/products/[id]/reviews');
  }
}
