import { Router } from "express";
import { prisma } from "../../config/prisma";
import { jwtAuth, requireRole } from "../../middleware/jwtAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { asyncHandler } from "../../utils/asyncHandler";
import { createUomSchema } from "./uom.schemas";

export const uomRouter = Router();

uomRouter.use(jwtAuth);

uomRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await prisma.unitOfMeasure.findMany({ orderBy: { name: "asc" } }));
  }),
);

uomRouter.post(
  "/",
  requireRole("MANAGER"),
  validateRequest({ body: createUomSchema }),
  asyncHandler(async (req, res) => {
    res.status(201).json(await prisma.unitOfMeasure.create({ data: req.body }));
  }),
);
