
import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

export const assignOrderSchema = z.object({
  assignedToId: z.string().min(1, 'Delivery user ID is required.'),
});

export const updateDeliveryStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  deliveryProofUrl: z.string().url().optional(),
});
