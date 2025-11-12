import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

const updateRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN', 'DELIVERY'], {
    required_error: 'Role is required',
    invalid_type_error: 'Invalid role type',
  }),
});

// PUT /api/admin/users/[id]/role - Update user role (admin only)
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const { id } = await params;
    const body = await req.json();
    const { role } = updateRoleSchema.parse(body);

    // Prevent admin from changing their own role
    if (session?.user?.id === id) {
      return NextResponse.json(
        { message: 'You cannot change your own role' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: 'User role updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    console.error('PUT /api/admin/users/[id]/role Error:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
