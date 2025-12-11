/* FILE: src/app/api/products/route.ts */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { z } from 'zod';
import { handleApiError } from '@/lib/api-error';

// Schema for creating products
const productCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  categoryId: z.string().optional(), // Make optional
  categoryIds: z.array(z.string()).optional(), // New field
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
}).refine(data => data.categoryId || (data.categoryIds && data.categoryIds.length > 0), {
  message: "At least one category is required",
  path: ["categoryIds"]
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const limit = searchParams.get('limit');
    const featured = searchParams.get('featured');

    const products = await prisma.product.findMany({
      where: {
        ...(categoryId ? {
          // Support filtering by categoryId via the join table (backward compatibility logic)
          categories: {
            some: {
              categoryId: categoryId
            }
          }
        } : {}),
        ...(featured === 'true' ? { featured: true } : {}),
      },
      take: limit ? parseInt(limit) : undefined,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    return handleApiError(error, 'GET /api/products');
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const body = await req.json();
    const data = productCreateSchema.parse(body);

    // Determine category IDs to link
    let categoryIds: string[] = [];
    if (data.categoryIds && data.categoryIds.length > 0) {
      categoryIds = data.categoryIds;
    } else if (data.categoryId) {
      categoryIds = [data.categoryId];
    }

    // Use transaction to create product and links
    const product = await prisma.$transaction(async (tx) => {
      // Create product
      const p = await tx.product.create({
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          images: data.images,
          stock: data.stock,
          categoryId: data.categoryId, // Keep populating for now if available
          sizes: data.sizes,
          colors: data.colors,
          featured: data.featured,
        },
      });

      // Create category links
      if (categoryIds.length > 0) {
        await tx.productCategory.createMany({
          data: categoryIds.map(cid => ({
            productId: p.id,
            categoryId: cid
          }))
        });
      }

      return p;
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'POST /api/products');
  }
}