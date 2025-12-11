import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { updateCategorySchema } from '@/lib/validations';
import { handleApiError, ApiError } from '@/lib/api-error';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Get products by category ID
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

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
      throw ApiError.notFound('Category');
    }

    return NextResponse.json(category);
  } catch (error) {
    return handleApiError(error, 'GET /api/categories/[id]');
  }
}

// Update a category
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const { id } = await params;
    const body = await req.json();
    const data = updateCategorySchema.parse(body);

    const updatedCategory = await prisma.category.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    return handleApiError(error, 'PUT /api/categories/[id]');
  }
}

// Delete a category
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const { id } = await params;

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Category successfully deleted.' }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'DELETE /api/categories/[id]');
  }
}
