/* FILE: src/app/api/products/[id]/route.ts */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { handleApiError, ApiError } from '@/lib/api-error';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Schema for updating products
const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  images: z.array(z.string()).optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.string().optional(),
  categoryIds: z.array(z.string()).optional(), // New field
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
});

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true
          }
        },
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
    const data = productUpdateSchema.parse(body);

    // Transaction for update
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Update basic fields
      const p = await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          images: data.images,
          stock: data.stock,
          categoryId: data.categoryId,
          sizes: data.sizes,
          colors: data.colors,
          featured: data.featured,
        },
      });

      // Update category links if categoryIds provided
      if (data.categoryIds) {
        // Delete existing links
        await tx.productCategory.deleteMany({
          where: { productId: id }
        });

        // Create new links
        if (data.categoryIds.length > 0) {
          await tx.productCategory.createMany({
            data: data.categoryIds.map(cid => ({
              productId: id,
              categoryId: cid
            }))
          });
        }
      } else if (data.categoryId) {
        // Fallback: if only categoryId provided (legacy update), replace links
        await tx.productCategory.deleteMany({
          where: { productId: id }
        });
        await tx.productCategory.create({
          data: {
            productId: id,
            categoryId: data.categoryId
          }
        });
      }

      return p;
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
      await tx.productCategory.deleteMany({ where: { productId: id } }); // Delete links
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