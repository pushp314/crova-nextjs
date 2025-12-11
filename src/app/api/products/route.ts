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
  categoryId: z.string().min(1, 'Category is required'),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const limit = searchParams.get('limit');
    const featured = searchParams.get('featured');

    const products = await prisma.product.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(featured === 'true' ? { featured: true } : {}),
      },
      take: limit ? parseInt(limit) : undefined,
      orderBy: {
        createdAt: 'desc',
      },
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

    const product = await prisma.product.create({
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

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'POST /api/products');
  }
}