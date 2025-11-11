
import { z } from 'zod';

export const bannerSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  text: z.string().optional(),
  imageUrl: z.string().url('Invalid URL for image.').optional().or(z.literal('')),
  linkUrl: z.string().url('Invalid URL for link.').optional().or(z.literal('')),
  active: z.boolean().default(false),
  priority: z.coerce.number().int().default(0),
  textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color.').optional().or(z.literal('')),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color.').optional().or(z.literal('')),
  startsAt: z.date().optional(),
  endsAt: z.date().optional(),
});

export type BannerFormValues = z.infer<typeof bannerSchema>;
