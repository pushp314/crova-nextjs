"use client";

import React, { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import type { Product, CartItem } from '@/lib/types';
import { toast } from "sonner";
import { useDebounce } from 'use-debounce';
import { useCartQuery, useAddToCart, useRemoveFromCart, useUpdateCartQuantity, useClearCart } from '@/hooks/use-cart';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  // React Query hooks
  const { data: cartData, isLoading } = useCartQuery(isAuthenticated);
  const addToCartMutation = useAddToCart();
  const removeFromCartMutation = useRemoveFromCart();
  const updateQuantityMutation = useUpdateCartQuantity();
  const clearCartMutation = useClearCart();

  const cartItems = cartData?.items ?? [];

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    if (status !== 'authenticated') {
      toast.error("Please log in to add items to your cart.");
      return;
    }
    addToCartMutation.mutate({ productId: product.id, quantity, product });
  }, [status, addToCartMutation]);

  const removeFromCart = useCallback((productId: string) => {
    removeFromCartMutation.mutate(productId);
  }, [removeFromCartMutation]);

  // Debounced update for quantity changes
  const debouncedUpdateQuantity = useCallback((productId: string, quantity: number) => {
    updateQuantityMutation.mutate({ productId, quantity });
  }, [updateQuantityMutation]);

  const [debouncedUpdate] = useDebounce(debouncedUpdateQuantity, 500);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      debouncedUpdate(productId, quantity);
    }
  }, [removeFromCart, debouncedUpdate]);

  const clearCart = useCallback(() => {
    clearCartMutation.mutate();
  }, [clearCartMutation]);

  const cartCount = useMemo(() =>
    cartItems.reduce((count, item) => count + item.quantity, 0),
    [cartItems]
  );

  const totalPrice = useMemo(() =>
    cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0),
    [cartItems]
  );

  const contextValue = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    totalPrice,
    isLoading,
  }), [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, totalPrice, isLoading]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
