import { z } from 'zod';

// ============================================================
// Product Schemas
// ============================================================

export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  images: z.array(z.string().url()).min(1, 'At least one image URL is required.'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative.'),
  categoryId: z.string().min(1, 'Category is required.'),
});

export const updateProductSchema = productSchema.partial();

// ============================================================
// Category Schemas
// ============================================================

export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().optional(),
});

export const updateCategorySchema = categorySchema.partial();

// ============================================================
// Cart Schemas
// ============================================================

export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required.'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1.'),
});

export const updateCartItemSchema = z.object({
    productId: z.string().min(1, 'Product ID is required.'),
    quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1.'),
});

// ============================================================
// Wishlist Schemas
// ============================================================

export const wishlistItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required.'),
});


// ============================================================
// Order Schemas
// ============================================================

export const orderStatusSchema = z.enum(['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);

export const createOrderSchema = z.object({}); // No input needed, created from cart

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
});
