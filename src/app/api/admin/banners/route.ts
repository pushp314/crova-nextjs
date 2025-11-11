
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';

// This is an admin-only route to get all banners for the management table
// The public route is /api/banners
export async function GET(req: Request) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const banners = await prisma.promotionBanner.findMany({
      orderBy: {
        priority: 'desc',
      },
    });

    return NextResponse.json(banners);
  } catch (error) {
     if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    console.error('[ADMIN_BANNERS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
