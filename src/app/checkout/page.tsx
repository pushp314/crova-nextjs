'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Loader2, CreditCard, Truck } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cartItems, totalPrice, cartCount, isLoading: isCartLoading, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && !isCartLoading && cartCount === 0) {
        toast.info("Your cart is empty. Redirecting to home.");
        router.push('/');
    }
  }, [status, router, isCartLoading, cartCount]);
  
  const handlePayment = async () => {
    if (!session?.user) {
        toast.error('You must be logged in to proceed.');
        return;
    }
    
    setIsProcessing(true);
    
    if (paymentMethod === 'razorpay') {
      await handleRazorpayPayment();
    } else if (paymentMethod === 'cod') {
      await handleCodPayment();
    }
    
    setIsProcessing(false);
  };

  const handleRazorpayPayment = async () => {
    try {
        const res = await fetch('/api/payment/razorpay', { method: 'POST' });
        if (!res.ok) throw new Error('Failed to create Razorpay order.');

        const { id: order_id, currency, amount } = await res.json();
        
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: amount.toString(),
            currency: currency,
            name: 'NOVA',
            description: 'Fashion Store Purchase',
            order_id: order_id,
            handler: function (response: any) {
                toast.success('Payment Successful!');
                // The webhook will handle order confirmation, stock reduction, and cart clearing.
                router.push('/profile');
            },
            prefill: {
                name: session?.user.name,
                email: session?.user.email,
            },
            theme: {
                color: '#3399cc'
            }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();

    } catch (error: any) {
        toast.error('Payment Initialization Failed', {
            description: error.message || "Could not connect to Razorpay. Please try again."
        });
    }
  };

  const handleCodPayment = async () => {
    try {
        const res = await fetch('/api/payment/cod', { method: 'POST' });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to place COD order.');
        }

        const order = await res.json();
        toast.success('Order Placed Successfully!', {
            description: `Your order #${order.id.substring(0,8)} will be delivered soon.`
        });
        
        // Cart is cleared on the backend, but we also clear it here
        // to ensure immediate UI update, as there is no page reload.
        clearCart();
        router.push('/profile');
        
    } catch (error: any) {
        toast.error('Order Failed', {
            description: error.message
        });
    }
  };

  if (status === 'loading' || isCartLoading) {
    return (
        <div className="container py-12 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
                <div>
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="container py-12 md:py-24">
      <h1 className="mb-8 text-center text-3xl font-bold md:text-4xl">
        Checkout
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} disabled={isProcessing}>
                        <Label htmlFor="razorpay" className="flex items-center gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[:checked]:border-primary">
                            <CreditCard className="h-6 w-6" />
                            <div className="flex-1">
                                <p className="font-semibold">Online Payment</p>
                                <p className="text-sm text-muted-foreground">Credit/Debit Card, UPI, Netbanking</p>
                            </div>
                            <RadioGroupItem value="razorpay" id="razorpay" />
                        </Label>
                        <Label htmlFor="cod" className="flex items-center gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[:checked]:border-primary">
                            <Truck className="h-6 w-6" />
                            <div className="flex-1">
                                <p className="font-semibold">Cash on Delivery</p>
                                <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                            </div>
                            <RadioGroupItem value="cod" id="cod" />
                        </Label>
                    </RadioGroup>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm">
                        {cartItems.map(item => (
                            <li key={item.id} className="flex justify-between">
                                <span className="text-muted-foreground">{item.product.name} x {item.quantity}</span>
                                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                    <Separator />
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>Free</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button 
                        className="w-full" 
                        size="lg" 
                        onClick={handlePayment} 
                        disabled={isProcessing || !paymentMethod || cartCount === 0}
                    >
                        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
