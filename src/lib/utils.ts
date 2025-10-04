import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { OrderStatus } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getOrderStatusVariant(status: OrderStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'PENDING':
      return 'secondary';
    case 'SHIPPED':
      return 'default';
    case 'DELIVERED':
      return 'default';
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'outline';
  }
}
