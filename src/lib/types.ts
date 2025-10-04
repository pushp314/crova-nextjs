import type { Product as PrismaProduct, Category, Order as PrismaOrder, OrderStatus, OrderItem as PrismaOrderItem, PaymentStatus, User as PrismaUser } from '@prisma/client';

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

export type Order = PrismaOrder & {
  items: OrderItem[];
  user?: Partial<PrismaUser>;
};

export type OrderItem = PrismaOrderItem & {
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
