
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import type { Product, CartItem } from '@/lib/types';
import { toast } from "sonner";
import { useDebounce } from 'use-debounce';

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
  const { data: session, status } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    if (status === 'authenticated') {
      setIsLoading(true);
      try {
        const res = await fetch('/api/cart');
        if (res.ok) {
          const data = await res.json();
          setCartItems(data.items || []);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error("Failed to fetch cart:", error);
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    } else if (status === 'unauthenticated') {
      setCartItems([]); // Clear cart for logged-out users
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (status !== 'authenticated') {
      toast.error("Please log in to add items to your cart.");
      return;
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity }),
      });

      if (!res.ok) throw new Error('Failed to add item to cart.');
      
      const { items } = await res.json();
      setCartItems(items);

      toast.success("Added to cart", {
        description: `${product.name} has been added to your cart.`,
      });

    } catch (error) {
      toast.error("Error adding to cart.", {
        description: "Could not add item to cart. Please try again.",
      });
    }
  };
  
  const removeFromCart = async (productId: string) => {
    try {
      const res = await fetch(`/api/cart/${productId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove item.');

      setCartItems(prev => prev.filter(item => item.productId !== productId));
      toast.info("Item removed from cart.");

    } catch (error) {
      toast.error("Error removing item.", {
        description: "Could not remove item. Please try again.",
      });
    }
  };

  const updateQuantityApi = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) throw new Error('Failed to update quantity');
      // No need to set state, local state is updated instantly for better UX
    } catch (error) {
      toast.error("Failed to update quantity.");
      // Optionally revert state on failure
    }
  };
  
  const [debouncedUpdate] = useDebounce(updateQuantityApi, 500);

  const updateQuantity = (productId: string, quantity: number) => {
     if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
      debouncedUpdate(productId, quantity);
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch('/api/cart/clear', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to clear cart.');

      setCartItems([]);
      toast.info("Cart cleared.");
    } catch (error) {
      toast.error("Error clearing cart.");
    }
  };
  
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, totalPrice, isLoading }}>
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
