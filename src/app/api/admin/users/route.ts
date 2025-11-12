
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { requireRole } from '@/lib/rbac';

// GET /api/admin/users - Get all users (admin only)
export async function GET(req: Request) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role') as UserRole;
    const skip = (page - 1) * limit;

    const whereClause = role ? { role } : {};

    const [users, total] = await prisma.$transaction([
        prisma.user.findMany({
            where: whereClause,
            skip,
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
            },
            orderBy: {
                email: 'asc',
            }
        }),
        prisma.user.count({ where: whereClause })
    ]);
    
    return NextResponse.json({
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total/limit)
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    console.error('GET /api/admin/users Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
