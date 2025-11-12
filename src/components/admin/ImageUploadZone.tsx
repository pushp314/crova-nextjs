"use client";

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { X, Upload, Loader2, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageUploadZoneProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
  className?: string;
  disabled?: boolean;
}

export function ImageUploadZone({
  images,
  onChange,
  maxImages = 6,
  maxSizeMB = 3,
  className,
  disabled = false,
}: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; errors: string[] } => {
      const valid: File[] = [];
      const errors: string[] = [];
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

      for (const file of files) {
        // Check file type
        if (!allowedTypes.includes(file.type)) {
          errors.push(`${file.name}: Invalid file type. Only JPEG, PNG, and WebP are allowed.`);
          continue;
        }

        // Check file size
        if (file.size > maxSizeBytes) {
          errors.push(`${file.name}: File too large. Maximum size is ${maxSizeMB}MB.`);
          continue;
        }

        valid.push(file);
      }

      // Check total count
      if (images.length + valid.length > maxImages) {
        errors.push(`Maximum ${maxImages} images allowed. You can upload ${maxImages - images.length} more.`);
        return { valid: [], errors };
      }

      return { valid, errors };
    },
    [images.length, maxImages, maxSizeMB]
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      setIsUploading(true);
      const formData = new FormData();

      // Use 'files' as the field name (matches formidable endpoint)
      files.forEach((file) => {
        formData.append('files', file);
      });

      try {
        const response = await fetch('/api/upload/product', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Upload failed');
        }

        const data = await response.json();
        
        if (data.filenames && Array.isArray(data.filenames)) {
          const newImages = [...images, ...data.filenames];
          onChange(newImages);
          toast.success(`Successfully uploaded ${data.filenames.length} image(s)`);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error: any) {
        console.error('Upload error:', error);
        toast.error('Upload failed', {
          description: error.message || 'Failed to upload images. Please try again.',
        });
      } finally {
        setIsUploading(false);
      }
    },
    [images, onChange]
  );

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const { valid, errors } = validateFiles(fileArray);

      // Show errors
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error));
      }

      // Upload valid files
      if (valid.length > 0) {
        await uploadFiles(valid);
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [validateFiles, uploadFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      await handleFileSelect(files);
    },
    [disabled, handleFileSelect]
  );

  const handleRemoveImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index);
      onChange(newImages);
      toast.success('Image removed');
    },
    [images, onChange]
  );

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const canAddMore = images.length < maxImages;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Zone */}
      {canAddMore && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 transition-all',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            disabled && 'opacity-50 cursor-not-allowed',
            !disabled && 'cursor-pointer'
          )}
          onClick={!disabled ? handleBrowseClick : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled || isUploading}
          />

          <div className="flex flex-col items-center justify-center text-center space-y-4">
            {isUploading ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Uploading images...</p>
                  <p className="text-xs text-muted-foreground">Please wait</p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-full bg-primary/10 p-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Drag & drop images here, or{' '}
                    <span className="text-primary">browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Max {maxImages} images, up to {maxSizeMB}MB each (JPEG, PNG, WebP)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Uploaded Images ({images.length}/{maxImages})
            </p>
            {canAddMore && !isUploading && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBrowseClick}
                disabled={disabled}
              >
                <Upload className="h-4 w-4 mr-2" />
                Add More
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {images.map((image, index) => {
              // If image is just a filename, prepend the path
              const imageSrc = image.startsWith('/') || image.startsWith('http') 
                ? image 
                : `/uploads/products/${image}`;
              
              return (
                <div
                  key={`${image}-${index}`}
                  className="relative group aspect-square rounded-lg border overflow-hidden bg-muted"
                >
                  <Image
                    src={imageSrc}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                
                {/* Primary Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
                    Primary
                  </div>
                )}

                {/* Remove Button */}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={() => handleRemoveImage(index)}
                  disabled={disabled}
                >
                    <X className="h-4 w-4" />
                  </Button>

                  {/* Image Index */}
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground">
            💡 The first image will be used as the primary product image
          </p>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !canAddMore && (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}
