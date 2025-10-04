"use client";

import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { useWishlist } from "@/contexts/wishlist-context";
import { Button } from "@/components/ui/button";
import ProductGrid from "@/components/product/product-grid";

export default function WishlistPage() {
    const { wishlistItems, isLoading } = useWishlist();

    if (isLoading) {
        return (
            <div className="container flex flex-col items-center justify-center gap-4 py-24 text-center">
                <Loader2 className="h-24 w-24 animate-spin text-muted-foreground" />
                <h2 className="text-3xl font-bold">Loading Your Wishlist...</h2>
            </div>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <div className="container flex flex-col items-center justify-center gap-4 py-24 text-center">
                <Heart className="h-24 w-24 text-muted-foreground" />
                <h2 className="text-3xl font-bold">Your Wishlist is Empty</h2>
                <p className="max-w-md text-muted-foreground">Looks like you haven't added anything yet. Start exploring and add your favorite items to your wishlist!</p>
                <Button asChild className="mt-4">
                    <Link href="/">Explore Products</Link>
                </Button>
            </div>
        );
    }

    const wishlistedProducts = wishlistItems.map(item => item.product);

    return (
        <div className="container py-12 md:py-24">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-bold">My Wishlist</h1>
                <p className="mt-2 text-muted-foreground">Your collection of favorite styles.</p>
            </div>
            <ProductGrid products={wishlistedProducts} />
        </div>
    );
}
