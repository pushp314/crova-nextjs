import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';

export async function GET(req: Request) {
  try {
    // Authenticate and authorize
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const role = searchParams.get('role');
    const emailVerified = searchParams.get('emailVerified');

    // Build where clause
    const whereClause: any = {};

    if (query) {
      whereClause.OR = [
        {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          email: {
            contains: query,
            mode: 'insensitive'
          }
        }
      ];
    }

    if (role) {
      whereClause.role = role;
    }

    if (emailVerified === 'true') {
      whereClause.emailVerified = { not: null };
    } else if (emailVerified === 'false') {
      whereClause.emailVerified = null;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        _count: {
          select: {
            orders: true
          }
        }
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    console.error('GET /api/admin/search/users Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
