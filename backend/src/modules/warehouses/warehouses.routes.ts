import { Router } from "express";
import { jwtAuth, requireRole } from "../../middleware/jwtAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { asyncHandler } from "../../utils/asyncHandler";
import { idParamSchema } from "../../common/schemas";
import { createWarehouseSchema, updateWarehouseSchema } from "./warehouses.schemas";
import { createHandler, deleteHandler, getHandler, listHandler, updateHandler } from "./warehouses.controller";

export const warehousesRouter = Router();

warehousesRouter.use(jwtAuth);

warehousesRouter.get("/", asyncHandler(listHandler));
warehousesRouter.get("/:id", validateRequest({ params: idParamSchema }), asyncHandler(getHandler));
warehousesRouter.post(
  "/",
  requireRole("MANAGER"),
  validateRequest({ body: createWarehouseSchema }),
  asyncHandler(createHandler),
);
warehousesRouter.patch(
  "/:id",
  requireRole("MANAGER"),
  validateRequest({ params: idParamSchema, body: updateWarehouseSchema }),
  asyncHandler(updateHandler),
);
warehousesRouter.delete(
  "/:id",
  requireRole("MANAGER"),
  validateRequest({ params: idParamSchema }),
  asyncHandler(deleteHandler),
);
