import { z } from "zod";

export const createWarehouseSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  shortCode: z
    .string()
    .trim()
    .min(1, "Short code is required")
    .max(10, "Short code must be 10 characters or fewer")
    .regex(/^[A-Za-z0-9]+$/, "Short code must be alphanumeric")
    .transform((v) => v.toUpperCase()),
  address: z.string().trim().max(255).optional(),
});

export const updateWarehouseSchema = z.object({
  name: z.string().trim().min(1).optional(),
  address: z.string().trim().max(255).optional(),
});

export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouseInput = z.infer<typeof updateWarehouseSchema>;
