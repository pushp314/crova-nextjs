
"use client";

import Link from "next/link";
import { Plus, Minus, X, ShoppingCart, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import SafeImage from "@/components/ui/safe-image";

export default function CartView() {
    const { cartItems, updateQuantity, removeFromCart, totalPrice, cartCount, isLoading } = useCart();
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
                <Loader2 className="h-24 w-24 animate-spin text-muted-foreground" />
                <h2 className="text-2xl font-semibold">Loading your cart...</h2>
            </div>
        );
    }

    if (cartCount === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
                <ShoppingCart className="h-24 w-24 text-muted-foreground" />
                <h2 className="text-2xl font-semibold">Your cart is empty</h2>
                <p className="text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
                <Button asChild>
                    <Link href="/">Continue Shopping</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <ul className="space-y-6">
                    {cartItems.map((item) => (
                        <li key={item.id} className="flex gap-4">
                            <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-md">
                                <SafeImage
                                    src={item.product.images[0]}
                                    alt={item.product.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex flex-1 flex-col justify-between">
                                <div>
                                    <h3 className="font-semibold">{item.product.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Price: ₹{item.product.price.toFixed(2)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 rounded-md border">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="w-8 text-center">{item.quantity}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end justify-between">
                                <p className="font-semibold">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground"
                                    onClick={() => removeFromCart(item.productId)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₹{totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>₹{totalPrice.toFixed(2)}</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full" size="lg">
                            <Link href="/checkout">Proceed to Checkout</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
