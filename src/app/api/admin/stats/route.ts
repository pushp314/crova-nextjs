import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const totalUsers = await prisma.user.count();
    const totalOrders = await prisma.order.count();

    const totalSalesData = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        status: {
          not: 'CANCELLED',
        },
      },
    });
    
    const totalSales = totalSalesData._sum.totalAmount || 0;

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalSales,
    });
  } catch (error) {
    console.error('GET /api/admin/stats Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
