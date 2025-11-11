
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';
import { bannerSchema } from '@/lib/validation/banner';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// GET /api/banners (public)
export async function GET(req: Request) {
  try {
    const now = new Date();
    const banners = await prisma.promotionBanner.findMany({
      where: {
        active: true,
        OR: [
          { startsAt: null, endsAt: null },
          { startsAt: { lte: now }, endsAt: { gte: now } },
          { startsAt: { lte: now }, endsAt: null },
          { startsAt: null, endsAt: { gte: now } },
        ],
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error('[BANNERS_GET]', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

export const revalidate = 60; // Revalidate public banner data every 60 seconds

// POST /api/banners (admin only)
export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const body = await req.json();
    const data = bannerSchema.parse(body);

    const banner = await prisma.promotionBanner.create({
      data,
    });

    revalidatePath('/admin/banners');
    revalidatePath('/'); // Revalidate home page for public banners

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    console.error('[BANNERS_POST]', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
