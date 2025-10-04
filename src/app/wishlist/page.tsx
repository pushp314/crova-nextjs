"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/contexts/wishlist-context";
import { Button } from "@/components/ui/button";
import ProductGrid from "@/components/product/product-grid";
import { Metadata } from "next";

// This is a client component, so we can't export metadata directly.
// We can set it in a parent layout or via the Head component if needed.
// For now, we'll just define it here for reference.
const metadata: Metadata = {
    title: "Your Wishlist - NOVA",
    description: "View and manage items in your wishlist.",
};


export default function WishlistPage() {
    const { wishlistItems } = useWishlist();

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

    const wishlistedProducts = wishlistItems.map(item => item);

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
