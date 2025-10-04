export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: 'women' | 'men';
  featured?: boolean;
  sizes: string[];
  colors: string[];
};

export type CartItem = {
  id: string; // combination of productId, size, color
  product: Product;
  quantity: number;
  size: string;
  color: string;
};
