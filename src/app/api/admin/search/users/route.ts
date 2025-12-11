import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';
import { Prisma } from '@prisma/client';
import { handleApiError } from '@/lib/api-error';

export async function GET(req: Request) {
  try {
    // Authenticate and authorize
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const role = searchParams.get('role');
    const emailVerified = searchParams.get('emailVerified');

    // Build where clause with proper Prisma types
    const whereClause: Prisma.UserWhereInput = {};

    if (query) {
      whereClause.OR = [
        {
          name: {
            contains: query,
            mode: 'insensitive' as const
          }
        },
        {
          email: {
            contains: query,
            mode: 'insensitive' as const
          }
        }
      ];
    }

    if (role) {
      whereClause.role = role as Prisma.EnumUserRoleFilter;
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
    return handleApiError(error, 'GET /api/admin/search/users');
  }
}
