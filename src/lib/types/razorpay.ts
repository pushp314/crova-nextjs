/**
 * Razorpay TypeScript Type Definitions
 * 
 * Provides type-safe interface for Razorpay checkout integration.
 */

export interface RazorpayOptions {
    key: string | undefined;
    amount: string;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
    prefill?: {
        name?: string | null;
        email?: string | null;
        contact?: string | null;
    };
    theme?: {
        color?: string;
    };
    modal?: {
        ondismiss?: () => void;
        escape?: boolean;
        animation?: boolean;
    };
}

export interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

export interface RazorpayInstance {
    open(): void;
    close(): void;
    on(event: string, handler: (response: RazorpayFailedResponse) => void): void;
}

export interface RazorpayFailedResponse {
    error: {
        code: string;
        description: string;
        source: string;
        step: string;
        reason: string;
        metadata: {
            order_id?: string;
            payment_id?: string;
        };
    };
}

export interface RazorpayConstructor {
    new(options: RazorpayOptions): RazorpayInstance;
}

// Extend Window interface for Razorpay
declare global {
    interface Window {
        Razorpay: RazorpayConstructor;
    }
}
