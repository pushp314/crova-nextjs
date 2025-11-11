
'use client';

import { useEffect, useState } from 'react';
import type { PromotionBanner } from '@/lib/types';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BannerFormDialog } from '@/components/admin/banners/BannerFormDialog';
import BannerTable from '@/components/admin/banners/BannerTable';

const LoadingSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </CardContent>
  </Card>
);

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<PromotionBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromotionBanner | null>(null);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/banners');
      if (res.ok) {
        setBanners(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load banners. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleAddBanner = () => {
    setEditingBanner(null);
    setIsDialogOpen(true);
  };

  const handleEditBanner = (banner: PromotionBanner) => {
    setEditingBanner(banner);
    setIsDialogOpen(true);
  };

  const onBannerSaved = (savedBanner: PromotionBanner) => {
    if (editingBanner) {
      setBanners(banners.map(b => b.id === savedBanner.id ? savedBanner : b));
    } else {
      setBanners([savedBanner, ...banners]);
    }
    setIsDialogOpen(false);
  };

  const onBannerDeleted = (bannerId: string) => {
    setBanners(banners.filter(b => b.id !== bannerId));
  };
  
  const onBannerToggled = (toggledBanner: PromotionBanner) => {
    setBanners(banners.map(b => b.id === toggledBanner.id ? toggledBanner : b));
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Promotional Banners</CardTitle>
            <CardDescription>Manage the ticker banners for your store.</CardDescription>
          </div>
          <Button onClick={handleAddBanner}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Banner
          </Button>
        </CardHeader>
        <CardContent>
          <BannerTable 
            data={banners} 
            onEdit={handleEditBanner} 
            onDelete={onBannerDeleted}
            onToggle={onBannerToggled}
          />
        </CardContent>
      </Card>
      <BannerFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        banner={editingBanner}
        onSave={onBannerSaved}
      />
    </>
  );
}
