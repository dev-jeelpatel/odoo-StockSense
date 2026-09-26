import { Router } from "express";
import { jwtAuth, requireRole } from "../../middleware/jwtAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { asyncHandler } from "../../utils/asyncHandler";
import { idParamSchema } from "../../common/schemas";
import { createProductSchema, listProductsQuerySchema, updateProductSchema } from "./products.schemas";
import { createHandler, deleteHandler, getHandler, listHandler, updateHandler } from "./products.controller";

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
