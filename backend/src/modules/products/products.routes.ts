import { Router } from "express";
import { jwtAuth, requireRole } from "../../middleware/jwtAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { asyncHandler } from "../../utils/asyncHandler";
import { idParamSchema } from "../../common/schemas";
import { createProductSchema, listProductsQuerySchema, updateProductSchema } from "./products.schemas";
import { createHandler, deleteHandler, getHandler, listHandler, updateHandler } from "./products.controller";
import { prisma } from "../../config/prisma";
import { z } from "zod";

export const productsRouter = Router();

productsRouter.use(jwtAuth);

productsRouter.get("/", validateRequest({ query: listProductsQuerySchema }), asyncHandler(listHandler));
productsRouter.get("/:id", validateRequest({ params: idParamSchema }), asyncHandler(getHandler));
productsRouter.post(
  "/",
  requireRole("MANAGER"),
  validateRequest({ body: createProductSchema }),
  asyncHandler(createHandler),
);
productsRouter.patch(
  "/:id",
  requireRole("MANAGER"),
  validateRequest({ params: idParamSchema, body: updateProductSchema }),
  asyncHandler(updateHandler),
);
productsRouter.delete(
  "/:id",
  requireRole("MANAGER"),
  validateRequest({ params: idParamSchema }),
  asyncHandler(deleteHandler),
);

// ── POST /products/import ──────────────────────────────────────────────────
const importRowSchema = z.object({
  name: z.string().trim().min(1),
  sku: z.string().trim().min(1),
  categoryName: z.string().trim().min(1),
  uomShortCode: z.string().trim().min(1),
  costPerUnit: z.coerce.number().int().min(0).default(0),
  reorderMin: z.coerce.number().int().min(0).default(0),
  reorderMax: z.coerce.number().int().min(0).default(0),
});
const importBodySchema = z.object({ rows: z.array(importRowSchema).min(1).max(500) });

productsRouter.post(
  "/import",
  requireRole("MANAGER"),
  validateRequest({ body: importBodySchema }),
  asyncHandler(async (req, res) => {
    const { rows } = req.body as z.infer<typeof importBodySchema>;
    let created = 0; let skipped = 0; const errors: string[] = [];

    for (const row of rows) {
      try {
        let category = await prisma.productCategory.findFirst({ where: { name: { equals: row.categoryName, mode: "insensitive" } } });
        if (!category) category = await prisma.productCategory.create({ data: { name: row.categoryName } });

        const uom = await prisma.unitOfMeasure.findFirst({ where: { shortCode: { equals: row.uomShortCode, mode: "insensitive" } } });
        if (!uom) { errors.push(`Row "${row.sku}": UoM "${row.uomShortCode}" not found`); skipped++; continue; }

        const existing = await prisma.product.findUnique({ where: { sku: row.sku } });
        if (existing) { skipped++; continue; }

        await prisma.product.create({
          data: { name: row.name, sku: row.sku, categoryId: category.id, uomId: uom.id, costPerUnit: row.costPerUnit, reorderMin: row.reorderMin, reorderMax: row.reorderMax },
        });
        created++;
      } catch (e: any) {
        errors.push(`Row "${row.sku}": ${e.message}`);
        skipped++;
      }
    }
    res.json({ created, skipped, errors });
  }),
);
