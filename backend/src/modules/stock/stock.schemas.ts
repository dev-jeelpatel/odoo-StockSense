import { z } from "zod";

export const listQuantsQuerySchema = z.object({
  productId: z.string().uuid().optional(),
  warehouseId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
});

export type ListQuantsQuery = z.infer<typeof listQuantsQuerySchema>;
