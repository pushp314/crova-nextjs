/* FILE: src/app/api/products/[id]/route.ts */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
// Import the correct schema for API updates
import { productUpdateSchema } from '@/lib/validation/product';
import { handleApiError, ApiError } from '@/lib/api-error';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
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
        },
      },
    });

    if (!product) {
      throw ApiError.notFound('Product');
    }

    // Calculate average rating
    const ratings = await prisma.rating.findMany({
      where: { productId: id }
    });

    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
      : 0;


    return NextResponse.json({ ...product, averageRating });
  } catch (error) {
    return handleApiError(error, 'GET /api/products/[id]');
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const { id } = await params;
    const body = await req.json();

    // Use productUpdateSchema, which expects arrays of strings
    const data = productUpdateSchema.parse(body);

    const updatedProduct = await prisma.product.update({
      where: { id },
      data, // Pass data directly, as it matches the schema
      include: {
        category: true
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    return handleApiError(error, 'PUT /api/products/[id]');
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      await tx.rating.deleteMany({ where: { productId: id } });
      await tx.review.deleteMany({ where: { productId: id } });
      await tx.cartItem.deleteMany({ where: { productId: id } });
      await tx.wishlistItem.deleteMany({ where: { productId: id } });
      await tx.orderItem.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });

    return NextResponse.json({ message: 'Product successfully deleted.' }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'DELETE /api/products/[id]');
  }
}