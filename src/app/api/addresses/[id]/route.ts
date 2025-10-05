import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateAddressSchema } from '@/lib/validations';
import { z } from 'zod';

interface RouteParams {
  params: {
    id: string;
  };
}

// PUT /api/addresses/:id - Update an address
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = updateAddressSchema.parse(body);

    const updatedAddress = await prisma.$transaction(async (tx) => {
      // If setting this address as default, unset other defaults first
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId: session.user.id, NOT: { id: params.id } },
          data: { isDefault: false },
        });
      }

      // Now update the address
      return tx.address.update({
        where: { id: params.id, userId: session.user.id },
        data,
      });
    });


    return NextResponse.json(updatedAddress);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
     if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ message: 'Address not found or you do not have permission to edit it.' }, { status: 404 });
    }
    console.error(`PUT /api/addresses/${params.id} Error:`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// DELETE /api/addresses/:id - Delete an address
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await prisma.address.delete({
      where: { id: params.id, userId: session.user.id },
    });

    return NextResponse.json({ message: 'Address successfully deleted.' }, { status: 200 });
  } catch (error) {
     if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ message: 'Address not found or you do not have permission to delete it.' }, { status: 404 });
    }
    console.error(`DELETE /api/addresses/${params.id} Error:`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
