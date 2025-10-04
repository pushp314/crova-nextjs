import type { Product as PrismaProduct, Category, OrderStatus } from '@prisma/client';

export type Product = Omit<PrismaProduct, 'createdAt' | 'updatedAt'> & {
  category: Category;
  sizes: string[];
  colors: string[];
  featured?: boolean;
};

export type CartItem = {
  id: string; // Prisma cart item ID
  productId: string;
  product: Product;
  quantity: number;
};

export type WishlistItem = {
  id: string; // Prisma wishlist item ID
  productId: string;
  product: Product;
}

export type Order = {
  id: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
};

export type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product: Product;
}

export type UserProfile = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  createdAt: string;
}
