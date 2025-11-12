/* FILE: src/app/api/products/route.ts */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { z } from 'zod';
// Import the correct schema for API creation
import { productCreateSchema } from '@/lib/validation/product';

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
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('GET /api/products Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const body = await req.json();
    
    // Use productCreateSchema, which expects arrays of strings
    const data = productCreateSchema.parse(body);

    // No mapping is needed; data is already in the correct format
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        images: data.images, // Directly use the string array
        stock: data.stock,
        categoryId: data.categoryId,
        sizes: data.sizes, // Directly use the string array
        colors: data.colors, // Directly use the string array
        featured: data.featured,
      },
      include: {
          category: true,
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error)
   {
    if (error instanceof z.ZodError) {
      // Improved error logging for easier debugging
      console.error('Zod validation error on POST /api/products:', error.errors);
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
     if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    console.error('POST /api/products Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}