"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import type { Product, WishlistItem } from '@/lib/types';
import { toast } from "sonner";

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  wishlistCount: number;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    if (status === 'authenticated') {
      setIsLoading(true);
      try {
        const res = await fetch('/api/wishlist');
        if (res.ok) {
          const data = await res.json();
          setWishlistItems(data.items || []);
        } else {
          setWishlistItems([]);
        }
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
        setWishlistItems([]);
      } finally {
        setIsLoading(false);
      }
    } else if (status === 'unauthenticated') {
      setWishlistItems([]); // Clear wishlist for logged-out users
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (product: Product) => {
     if (status !== 'authenticated') {
      toast.error("Please log in to add items to your wishlist.");
      return;
    }
    if (isWishlisted(product.id)) return;
    
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      if (!res.ok) throw new Error('Failed to add to wishlist');

      const updatedWishlist = await res.json();
      setWishlistItems(updatedWishlist.items);
      
      toast.success("Added to wishlist", {
        description: `${product.name} has been added to your wishlist.`,
      });
    } catch(e) {
      toast.error("Failed to add to wishlist.");
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const itemToRemove = wishlistItems.find(item => item.product.id === productId)?.product;

    try {
      const res = await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove from wishlist');

      setWishlistItems(prevItems => prevItems.filter(item => item.productId !== productId));

      if (itemToRemove) {
        toast.info("Removed from wishlist", {
          description: `${itemToRemove.name} has been removed from your wishlist.`,
        });
      }
    } catch (e) {
      toast.error("Failed to remove from wishlist.");
    }
  };

  const isWishlisted = (productId: string) => {
    return wishlistItems.some(item => item.productId === productId);
  };
  
  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isWishlisted, wishlistCount, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
