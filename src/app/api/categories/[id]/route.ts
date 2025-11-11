
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { updateCategorySchema } from '@/lib/validations';
import { z } from 'zod';

interface RouteParams {
  params: {
    id: string;
  };
}

// Get products by category ID
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ message: 'Category not found.' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error(`GET /api/categories/${params.id} Error:`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// Update a category
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const { id } = params;
    const body = await req.json();
    const data = updateCategorySchema.parse(body);

    const updatedCategory = await prisma.category.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
     if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ message: 'Category not found.' }, { status: 404 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    console.error(`PUT /api/categories/${params.id} Error:`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// Delete a category
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const { id } = params;
    
    // Note: You might want to handle what happens to products in this category.
    // By default, if there are products associated, Prisma will throw an error
    // unless cascading deletes are configured.
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Category successfully deleted.' }, { status: 200 });
  } catch (error) {
     if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ message: 'Category not found.' }, { status: 404 });
    }
    if (error instanceof Error && 'code' in error && error.code === 'P2003') {
       return NextResponse.json({ message: 'Cannot delete category because it contains products.' }, { status: 409 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    console.error(`DELETE /api/categories/${params.id} Error:`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
