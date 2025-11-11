
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PaymentStatus } from '@prisma/client';
import { requireRole } from '@/lib/rbac';

export async function GET(req: Request) {
  try {
    const session = await getCurrentUser();
    requireRole(session, ['ADMIN']);

    const totalUsers = await prisma.user.count();
    const totalOrders = await prisma.order.count();

    const revenueData = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        paymentStatus: PaymentStatus.PAID,
      },
    });
    const totalRevenue = revenueData._sum.totalAmount || 0;
    
    const pendingPayments = await prisma.order.count({
        where: {
            paymentStatus: PaymentStatus.PENDING,
        }
    });

    const codOrders = await prisma.order.count({
        where: {
            paymentMethod: 'cod',
        }
    });

    const onlineOrders = await prisma.order.count({
        where: {
            paymentMethod: 'razorpay',
        }
    });


    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalRevenue,
      pendingPayments,
      codOrders,
      onlineOrders,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    console.error('GET /api/admin/stats Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
