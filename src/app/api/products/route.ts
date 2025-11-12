
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { z } from 'zod';

// This schema now matches the structure sent by react-hook-form's useFieldArray
const postProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative.'),
  categoryId: z.string().min(1, 'Category is required.'),
  images: z.array(z.object({ value: z.string().url() })).min(1, 'At least one image is required.'),
  sizes: z.array(z.object({ value: z.string().min(1) })).min(1, 'At least one size is required.'),
  colors: z.array(z.object({ value: z.string().min(1) })).min(1, 'At least one color is required.'),
  featured: z.boolean().default(false),
}).required();


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
    const data = postProductSchema.parse(body);

    // Map the array of objects to an array of strings before saving
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        images: data.images.map(img => img.value),
        stock: data.stock,
        categoryId: data.categoryId,
        sizes: data.sizes.map(s => s.value),
        colors: data.colors.map(c => c.value),
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
