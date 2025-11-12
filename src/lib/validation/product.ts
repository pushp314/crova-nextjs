import { z } from 'zod';

/**
 * Product Validation Schemas
 * 
 * These schemas validate product data for creation, updates, and image uploads
 */

// Base product schema with all required fields
export const productCreateSchema = z.object({
  name: z.string()
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name must not exceed 100 characters'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  
  price: z.number()
    .positive('Price must be a positive number')
    .min(0.01, 'Price must be at least 0.01')
    .max(999999.99, 'Price is too high'),
  
  stock: z.number()
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative')
    .max(999999, 'Stock value is too high'),
  
  categoryId: z.string()
    .min(1, 'Category is required')
    .cuid('Invalid category ID format'),
  
  images: z.array(z.string().min(1, 'Image path cannot be empty'))
    .min(1, 'At least one product image is required')
    .max(6, 'Maximum 6 images allowed per product'),
  
  sizes: z.array(z.string().min(1, 'Size cannot be empty'))
    .min(1, 'At least one size is required')
    .max(20, 'Maximum 20 sizes allowed'),
  
  colors: z.array(z.string().min(1, 'Color cannot be empty'))
    .min(1, 'At least one color is required')
    .max(20, 'Maximum 20 colors allowed'),
  
  featured: z.boolean()
    .default(false)
    .optional(),
});

// Schema for updating products (all fields optional except validation rules apply when provided)
export const productUpdateSchema = z.object({
  name: z.string()
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name must not exceed 100 characters')
    .optional(),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .optional(),
  
  price: z.number()
    .positive('Price must be a positive number')
    .min(0.01, 'Price must be at least 0.01')
    .max(999999.99, 'Price is too high')
    .optional(),
  
  stock: z.number()
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative')
    .max(999999, 'Stock value is too high')
    .optional(),
  
  categoryId: z.string()
    .min(1, 'Category is required')
    .cuid('Invalid category ID format')
    .optional(),
  
  images: z.array(z.string().min(1, 'Image path cannot be empty'))
    .min(1, 'At least one product image is required')
    .max(6, 'Maximum 6 images allowed per product')
    .optional(),
  
  sizes: z.array(z.string().min(1, 'Size cannot be empty'))
    .min(1, 'At least one size is required')
    .max(20, 'Maximum 20 sizes allowed')
    .optional(),
  
  colors: z.array(z.string().min(1, 'Color cannot be empty'))
    .min(1, 'At least one color is required')
    .max(20, 'Maximum 20 colors allowed')
    .optional(),
  
  featured: z.boolean()
    .optional(),
});

// Schema for image upload validation (client-side)
export const productImageUploadSchema = z.object({
  files: z.array(
    z.instanceof(File)
      .refine(
        (file) => file.size <= 3 * 1024 * 1024,
        'Each file must be less than 3MB'
      )
      .refine(
        (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
        'Only JPEG, PNG, and WebP images are allowed'
      )
  )
    .min(1, 'At least one image is required')
    .max(6, 'Maximum 6 images can be uploaded at once'),
});

// Schema for form data with nested objects (used by react-hook-form)
export const productFormSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be a positive number'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  categoryId: z.string().min(1, 'Category is required'),
  images: z.array(z.object({ value: z.string().min(1) })).min(1, 'At least one image is required'),
  sizes: z.array(z.object({ value: z.string().min(1) })).min(1, 'At least one size is required'),
  colors: z.array(z.object({ value: z.string().min(1) })).min(1, 'At least one color is required'),
  featured: z.boolean().default(false),
});

// Type exports
export type ProductCreate = z.infer<typeof productCreateSchema>;
export type ProductUpdate = z.infer<typeof productUpdateSchema>;
export type ProductImageUpload = z.infer<typeof productImageUploadSchema>;
export type ProductForm = z.infer<typeof productFormSchema>;
