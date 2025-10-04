import CartView from "@/components/cart/cart-view";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Your Cart - NOVA",
    description: "Review items in your shopping cart.",
};

export default function CartPage() {
    return (
        <div className="container py-12 md:py-24">
            <h1 className="mb-8 text-center text-3xl font-bold md:text-4xl">
                Shopping Cart
            </h1>
            <CartView />
        </div>
    );
}
