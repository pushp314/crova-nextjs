import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateAddressSchema } from '@/lib/validations';
import { handleApiError, ApiError } from '@/lib/api-error';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PUT /api/addresses/:id - Update an address
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    if (!session?.user?.id) {
      throw ApiError.unauthorized();
    }

    const { id } = await params;
    const body = await req.json();
    const data = updateAddressSchema.parse(body);

    const updatedAddress = await prisma.$transaction(async (tx) => {
      // If setting this address as default, unset other defaults first
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId: session.user.id, NOT: { id } },
          data: { isDefault: false },
        });
      }

      // Now update the address
      return tx.address.update({
        where: { id, userId: session.user.id },
        data,
      });
    });

    return NextResponse.json(updatedAddress);
  } catch (error) {
    return handleApiError(error, 'PUT /api/addresses/[id]');
  }
}

// DELETE /api/addresses/:id - Delete an address
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    if (!session?.user?.id) {
      throw ApiError.unauthorized();
    }

    const { id } = await params;

    await prisma.address.delete({
      where: { id, userId: session.user.id },
    });

    return NextResponse.json({ message: 'Address successfully deleted.' }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'DELETE /api/addresses/[id]');
  }
}
