"use client";

import React, { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import type { Product, WishlistItem } from '@/lib/types';
import { toast } from "sonner";
import { useWishlistQuery, useAddToWishlist, useRemoveFromWishlist } from '@/hooks/use-wishlist';

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
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  // React Query hooks
  const { data: wishlistData, isLoading } = useWishlistQuery(isAuthenticated);
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();

  const wishlistItems = wishlistData?.items ?? [];

  const addToWishlist = useCallback((product: Product) => {
    if (status !== 'authenticated') {
      toast.error("Please log in to add items to your wishlist.");
      return;
    }
    // Check if already wishlisted
    if (wishlistItems.some(item => item.productId === product.id)) {
      return;
    }
    addToWishlistMutation.mutate({ productId: product.id, product });
  }, [status, wishlistItems, addToWishlistMutation]);

  const removeFromWishlist = useCallback((productId: string) => {
    const item = wishlistItems.find(item => item.product.id === productId);
    removeFromWishlistMutation.mutate({
      productId,
      productName: item?.product.name
    });
  }, [wishlistItems, removeFromWishlistMutation]);

  const isWishlisted = useCallback((productId: string) => {
    return wishlistItems.some(item => item.productId === productId);
  }, [wishlistItems]);

  const wishlistCount = wishlistItems.length;

  const contextValue = useMemo(() => ({
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isWishlisted,
    wishlistCount,
    isLoading,
  }), [wishlistItems, addToWishlist, removeFromWishlist, isWishlisted, wishlistCount, isLoading]);

  return (
    <WishlistContext.Provider value={contextValue}>
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
