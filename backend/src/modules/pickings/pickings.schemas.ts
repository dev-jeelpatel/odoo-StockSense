import { z } from "zod";

const lineInputSchema = z.object({
  productId: z.string().uuid("Invalid product"),
  quantity: z.coerce.number().int().positive("Quantity must be greater than zero"),
});

export const createPickingSchema = z
  .object({
    pickingType: z.enum(["RECEIPT", "DELIVERY", "INTERNAL"]),
    warehouseId: z.string().uuid("Select a warehouse"),
    partnerName: z.string().trim().max(120).optional(),
    scheduledDate: z.coerce.date(),
    sourceLocationId: z.string().uuid().optional(),
    destLocationId: z.string().uuid().optional(),
    responsibleUserId: z.string().uuid().optional(),
    lines: z.array(lineInputSchema).min(1, "Add at least one product line"),
  })
  .superRefine((data, ctx) => {
    if (data.pickingType === "INTERNAL") {
      if (!data.sourceLocationId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Source location is required", path: ["sourceLocationId"] });
      }
      if (!data.destLocationId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Destination location is required", path: ["destLocationId"] });
      }
    }
  });

export const updatePickingSchema = z.object({
  partnerName: z.string().trim().max(120).optional(),
  scheduledDate: z.coerce.date().optional(),
  responsibleUserId: z.string().uuid().nullable().optional(),
});

export const replaceLinesSchema = z.object({
  lines: z.array(lineInputSchema).min(1, "Add at least one product line"),
});

export const listPickingsQuerySchema = z.object({
  pickingType: z.enum(["RECEIPT", "DELIVERY", "INTERNAL", "ADJUSTMENT"]).optional(),
  status: z.enum(["DRAFT", "WAITING", "READY", "DONE", "CANCELLED"]).optional(),
  warehouseId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().trim().optional(),
});

export const createAdjustmentSchema = z.object({
  warehouseId: z.string().uuid("Select a warehouse"),
  locationId: z.string().uuid("Select a location"),
  scheduledDate: z.coerce.date().optional(),
  lines: z
    .array(
      z.object({
        productId: z.string().uuid("Invalid product"),
        countedQuantity: z.coerce.number().int().min(0, "Counted quantity cannot be negative"),
      }),
    )
    .min(1, "Add at least one product line"),
});

export type CreatePickingInput = z.infer<typeof createPickingSchema>;
export type UpdatePickingInput = z.infer<typeof updatePickingSchema>;
export type ReplaceLinesInput = z.infer<typeof replaceLinesSchema>;
export type CreateAdjustmentInput = z.infer<typeof createAdjustmentSchema>;
