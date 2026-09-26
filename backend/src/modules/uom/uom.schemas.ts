import { z } from "zod";

export const createUomSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  shortCode: z.string().trim().min(1, "Short code is required").max(10),
});

export type CreateUomInput = z.infer<typeof createUomSchema>;
