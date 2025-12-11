
import type { Product as PrismaProduct, Category as PrismaCategory, Order as PrismaOrder, OrderStatus, OrderItem as PrismaOrderItem, PaymentStatus, User as PrismaUser, Review as PrismaReview, Rating as PrismaRating, Address as PrismaAddress, PromotionBanner as PrismaPromotionBanner } from '@prisma/client';

export type Product = Omit<PrismaProduct, 'createdAt' | 'updatedAt'> & {
  category?: PrismaCategory;
  sizes: string[];
  colors: string[];
  featured: boolean;
  reviews?: Review[];
  averageRating?: number;
};

export type Category = PrismaCategory & {
  _count?: {
    products: number;
  };
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
  shippingAddress: Address | null;
  assignedTo?: Partial<PrismaUser> | null;
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

export type Review = PrismaReview & {
  user: Pick<PrismaUser, 'id' | 'name' | 'image'>;
  rating: Rating | null;
};

export type Rating = PrismaRating;

export type Address = PrismaAddress;

export type PromotionBanner = PrismaPromotionBanner;
