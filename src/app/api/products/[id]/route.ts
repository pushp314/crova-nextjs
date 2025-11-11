
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { updateProductSchema } from '@/lib/validations';
import { z } from 'zod';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = params;

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
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
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
    console.error(`GET /api/products/${params.id} Error:`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const { id } = params;
    const body = await req.json();
    const data = updateProductSchema.parse(body);

    const updatedProduct = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
     if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }
     if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    console.error(`PUT /api/products/${params.id} Error:`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const { id } = params;
    
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
     if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    console.error(`DELETE /api/products/${params.id} Error:`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
