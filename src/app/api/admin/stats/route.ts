import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole, PaymentStatus } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

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
    console.error('GET /api/admin/stats Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
