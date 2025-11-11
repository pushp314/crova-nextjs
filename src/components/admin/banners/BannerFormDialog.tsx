
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { PromotionBanner } from '@/lib/types';
import { bannerSchema, type BannerFormValues } from '@/lib/validation/banner';
import { toast } from 'sonner';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface BannerFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  banner: PromotionBanner | null;
  onSave: (banner: PromotionBanner) => void;
}

export function BannerFormDialog({ isOpen, onOpenChange, banner, onSave }: BannerFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const isEditing = !!banner;

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: '',
      text: '',
      linkUrl: '',
      imageUrl: '',
      active: false,
      priority: 0,
      textColor: '#FFFFFF',
      backgroundColor: '#000000',
      startsAt: undefined,
      endsAt: undefined,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (banner) {
        form.reset({
          ...banner,
          text: banner.text || '',
          linkUrl: banner.linkUrl || '',
          imageUrl: banner.imageUrl || '',
          startsAt: banner.startsAt ? new Date(banner.startsAt) : undefined,
          endsAt: banner.endsAt ? new Date(banner.endsAt) : undefined,
        });
      } else {
        form.reset({
          title: '',
          text: '',
          linkUrl: '',
          imageUrl: '',
          active: false,
          priority: 0,
          textColor: '#FFFFFF',
          backgroundColor: '#000000',
          startsAt: undefined,
          endsAt: undefined,
        });
      }
    }
  }, [isOpen, banner, form]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload?bucket=banners', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Image upload failed');
      }

      const { url } = await res.json();
      form.setValue('imageUrl', url);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error('Upload Failed', { description: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: BannerFormValues) => {
    setIsLoading(true);
    const url = isEditing ? `/api/banners/${banner?.id}` : '/api/banners';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} banner.`);
      }

      const savedBanner = await res.json();
      onSave(savedBanner);
      toast.success(`Banner ${isEditing ? 'updated' : 'created'} successfully!`);
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Operation Failed', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const imageUrl = form.watch('imageUrl');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
          <DialogDescription>Fill in the details for the promotional banner.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="text" render={({ field }) => (
                <FormItem><FormLabel>Text (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="linkUrl" render={({ field }) => (
                <FormItem><FormLabel>Link URL (Optional)</FormLabel><FormControl><Input {...field} placeholder="https://example.com/sale" /></FormControl><FormMessage /></FormItem>
            )}/>

             <FormItem>
              <FormLabel>Image (Optional)</FormLabel>
              <div className="flex items-center gap-4">
                <Input type="file" onChange={handleImageUpload} disabled={isUploading} />
                {isUploading && <Loader2 className="h-5 w-5 animate-spin" />}
              </div>
              {imageUrl && (
                <div className="mt-4 relative w-full h-24 rounded-md overflow-hidden border">
                  <Image src={imageUrl} alt="Banner image preview" layout="fill" objectFit="contain" />
                </div>
              )}
            </FormItem>

             <div className="grid grid-cols-2 gap-4">
               <FormField control={form.control} name="backgroundColor" render={({ field }) => (
                  <FormItem><FormLabel>Background Color</FormLabel><FormControl><Input type="color" {...field} /></FormControl><FormMessage /></FormItem>
               )}/>
                <FormField control={form.control} name="textColor" render={({ field }) => (
                    <FormItem><FormLabel>Text Color</FormLabel><FormControl><Input type="color" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
             </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="startsAt" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel>
                        <Popover><PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent></Popover><FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="endsAt" render={({ field }) => (
                     <FormItem className="flex flex-col"><FormLabel>End Date</FormLabel>
                        <Popover><PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent></Popover><FormMessage />
                    </FormItem>
                )}/>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="priority" render={({ field }) => (
                    <FormItem><FormLabel>Priority</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="active" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-8">
                        <div className="space-y-0.5"><FormLabel>Active</FormLabel></div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                )}/>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading || isUploading}>
                {(isLoading || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Save Changes' : 'Create Banner'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
