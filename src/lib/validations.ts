
import { z } from 'zod';

// ============================================================
// Product Schemas
// ============================================================
const stringArray = z.array(z.object({ value: z.string().min(1) }));
const stringUrlArray = z.array(z.object({ value: z.string().url() }));

export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  images: stringUrlArray.min(1, 'At least one image URL is required.'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative.'),
  categoryId: z.string().min(1, 'Category is required.'),
  sizes: stringArray.min(1, 'At least one size is required.'),
  colors: stringArray.min(1, 'At least one color is required.'),
  featured: z.boolean().default(false),
});

export const updateProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters.').optional(),
  price: z.coerce.number().positive('Price must be a positive number.').optional(),
  images: z.array(z.string().url()).min(1, 'At least one image URL is required.').optional(),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative.').optional(),
  categoryId: z.string().min(1, 'Category is required.').optional(),
  sizes: z.array(z.string().min(1)).min(1, 'At least one size is required.').optional(),
  colors: z.array(z.string().min(1)).min(1, 'At least one color is required.').optional(),
  featured: z.boolean().optional(),
});


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
export const orderStatusSchema = z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);

export const createOrderSchema = z.object({}); // No input needed, created from cart

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
});


// ============================================================
// Address Schemas
// ============================================================
export const addressSchema = z.object({
    street: z.string().min(3, 'Street address is required.'),
    city: z.string().min(2, 'City is required.'),
    state: z.string().min(2, 'State is required.'),
    postalCode: z.string().min(4, 'Postal code is required.'),
    country: z.string().min(2, 'Country is required.'),
    isDefault: z.boolean().default(false).optional(),
});

export const updateAddressSchema = addressSchema.partial();
