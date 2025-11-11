
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';
import { bannerSchema } from '@/lib/validation/banner';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

interface RouteParams {
  params: {
    id: string;
  };
}

// PUT /api/banners/:id (admin only)
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const body = await req.json();
    const data = bannerSchema.partial().parse(body);

    const updatedBanner = await prisma.promotionBanner.update({
      where: { id: params.id },
      data,
    });

    revalidatePath('/admin/banners');
    revalidatePath('/'); // Revalidate home page for public banners

    return NextResponse.json(updatedBanner);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ message: 'Banner not found.' }, { status: 404 });
    }
    console.error(`[BANNERS_PUT_${params.id}]`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// DELETE /api/banners/:id (admin only)
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    await prisma.promotionBanner.delete({
      where: { id: params.id },
    });
    
    revalidatePath('/admin/banners');
    revalidatePath('/');

    return NextResponse.json({ message: 'Banner successfully deleted.' }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ message: 'Banner not found.' }, { status: 404 });
    }
    console.error(`[BANNERS_DELETE_${params.id}]`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
