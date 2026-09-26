import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  sku: z.string().trim().min(1, "SKU is required").max(50),
  categoryId: z.string().uuid("Select a category"),
  uomId: z.string().uuid("Select a unit of measure"),
  costPerUnit: z.coerce.number().int().min(0).default(0),
  reorderMin: z.coerce.number().int().min(0).default(0),
  reorderMax: z.coerce.number().int().min(0).default(0),
  initialStock: z
    .object({
      locationId: z.string().uuid(),
      quantity: z.coerce.number().int().min(1),
    })
    .optional(),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(1).optional(),
  categoryId: z.string().uuid().optional(),
  uomId: z.string().uuid().optional(),
  costPerUnit: z.coerce.number().int().min(0).optional(),
  reorderMin: z.coerce.number().int().min(0).optional(),
  reorderMax: z.coerce.number().int().min(0).optional(),
});

export const listProductsQuerySchema = z.object({
  search: z.string().trim().optional(),
  categoryId: z.string().uuid().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
