import { z } from "zod";

export const createLocationSchema = z.object({
  warehouseId: z.string().uuid("Invalid warehouse"),
  name: z.string().trim().min(1, "Name is required"),
  shortCode: z
    .string()
    .trim()
    .min(1, "Short code is required")
    .max(20)
    .transform((v) => v.toUpperCase()),
  parentLocationId: z.string().uuid().nullable().optional(),
});

export const updateLocationSchema = z.object({
  name: z.string().trim().min(1).optional(),
  parentLocationId: z.string().uuid().nullable().optional(),
});

export const listLocationsQuerySchema = z.object({
  warehouseId: z.string().uuid().optional(),
});

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
