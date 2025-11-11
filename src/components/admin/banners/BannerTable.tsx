
'use client';

import { useState } from 'react';
import type { PromotionBanner } from '@/lib/types';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface BannerTableProps {
  data: PromotionBanner[];
  onEdit: (banner: PromotionBanner) => void;
  onDelete: (bannerId: string) => void;
  onToggle: (banner: PromotionBanner) => void;
}

export default function BannerTable({ data, onEdit, onDelete, onToggle }: BannerTableProps) {
  const [isToggling, setIsToggling] = useState<string | null>(null);

  const handleDelete = async (bannerId: string) => {
    try {
      const res = await fetch(`/api/banners/${bannerId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete banner');
      onDelete(bannerId);
      toast.success('Banner deleted successfully');
    } catch (error: any) {
      toast.error('Deletion failed', { description: error.message });
    }
  };

  const handleToggle = async (banner: PromotionBanner) => {
    setIsToggling(banner.id);
    try {
        const res = await fetch(`/api/banners/${banner.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: !banner.active }),
        });
        if (!res.ok) throw new Error('Failed to toggle status');
        const updatedBanner = await res.json();
        onToggle(updatedBanner);
        toast.success(`Banner status updated to ${updatedBanner.active ? 'Active' : 'Inactive'}`);
    } catch (error: any) {
        toast.error('Update failed', { description: error.message });
    } finally {
        setIsToggling(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead><span className="sr-only">Actions</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? data.map((banner) => (
            <TableRow key={banner.id}>
              <TableCell className="font-medium">{banner.title}</TableCell>
              <TableCell>
                <Switch
                  checked={banner.active}
                  onCheckedChange={() => handleToggle(banner)}
                  disabled={isToggling === banner.id}
                />
              </TableCell>
              <TableCell>{banner.priority}</TableCell>
              <TableCell>{banner.startsAt ? format(new Date(banner.startsAt), 'PPP') : 'N/A'}</TableCell>
              <TableCell>{banner.endsAt ? format(new Date(banner.endsAt), 'PPP') : 'N/A'}</TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => onEdit(banner)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <button className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                           </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(banner.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Yes, delete it
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          )) : (
             <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                    No banners found.
                </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
