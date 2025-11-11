
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

// GET /api/admin/users - Get all users (admin only)
export async function GET(req: Request) {
    const session = await getCurrentUser();

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
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
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc',
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
}
