
'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Users, CreditCard, Activity, Package } from 'lucide-react';
import StatCard from '@/components/admin/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingPayments: number;
  codOrders: number;
  onlineOrders: number;
}

const LoadingSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
           <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-5 w-2/5" />
                  <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                  <Skeleton className="h-8 w-3/5" />
                  <Skeleton className="mt-2 h-4 w-4/5" />
              </CardContent>
          </Card>
      ))}
  </div>
);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading || !stats) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 md:gap-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            description="Sum of all successful payments"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={Package}
            description="Total number of orders placed"
          />
          <StatCard
            title="Total Customers"
            value={stats.totalUsers}
            icon={Users}
            description="Total registered users"
          />
           <StatCard
            title="Pending Payments"
            value={stats.pendingPayments}
            icon={CreditCard}
            description="Orders awaiting payment"
          />
          <StatCard
            title="COD Orders"
            value={stats.codOrders}
            icon={Activity}
            description="Cash on Delivery orders"
          />
          <StatCard
            title="Online Orders"
            value={stats.onlineOrders}
            icon={CreditCard}
            description="Orders paid via Razorpay"
          />
        </div>
      </main>
    </div>
  );
}
