import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';
import { bannerSchema } from '@/lib/validation/banner';
import { revalidatePath } from 'next/cache';
import { handleApiError } from '@/lib/api-error';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PUT /api/banners/:id (admin only)
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const { id } = await params;
    const body = await req.json();
    const data = bannerSchema.partial().parse(body);

    const updatedBanner = await prisma.promotionBanner.update({
      where: { id },
      data,
    });

    revalidatePath('/admin/banners');
    revalidatePath('/'); // Revalidate home page for public banners

    return NextResponse.json(updatedBanner);
  } catch (error) {
    return handleApiError(error, 'PUT /api/banners/[id]');
  }
}

// DELETE /api/banners/:id (admin only)
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const { id } = await params;

    await prisma.promotionBanner.delete({
      where: { id },
    });

    revalidatePath('/admin/banners');
    revalidatePath('/');

    return NextResponse.json({ message: 'Banner successfully deleted.' }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'DELETE /api/banners/[id]');
  }
}
