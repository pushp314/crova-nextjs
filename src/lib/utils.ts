
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { BadgeProps } from "@/components/ui/badge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getOrderStatusVariant(status: OrderStatus): BadgeProps['variant'] {
  switch (status) {
    case 'PENDING':
      return 'secondary';
    case 'PROCESSING':
      return 'default';
    case 'SHIPPED':
      return 'default';
    case 'DELIVERED':
      return 'default'; // Should be a success variant, but we use default
    case 'CANCELLED':
      return 'destructive';
    case 'OUT_FOR_DELIVERY':
      return 'secondary';
    case 'DELIVERY_FAILED':
      return 'destructive';
    default:
      return 'outline';
  }
}

export function getPaymentStatusVariant(status: PaymentStatus): BadgeProps['variant'] {
   switch (status) {
    case 'PENDING':
      return 'secondary';
    case 'PAID':
      return 'default'; // Success
    case 'FAILED':
      return 'destructive';
    default:
      return 'outline';
  }
}
