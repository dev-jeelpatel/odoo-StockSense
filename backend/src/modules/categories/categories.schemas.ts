import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  parentId: z.string().uuid().nullable().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
