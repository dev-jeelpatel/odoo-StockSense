import { Router } from "express";
import { jwtAuth, requireRole } from "../../middleware/jwtAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { asyncHandler } from "../../utils/asyncHandler";
import { idParamSchema } from "../../common/schemas";
import { createCategorySchema, updateCategorySchema } from "./categories.schemas";
import { createHandler, deleteHandler, getHandler, listHandler, updateHandler } from "./categories.controller";

export const categoriesRouter = Router();

categoriesRouter.use(jwtAuth);

categoriesRouter.get("/", asyncHandler(listHandler));
categoriesRouter.get("/:id", validateRequest({ params: idParamSchema }), asyncHandler(getHandler));
categoriesRouter.post(
  "/",
  requireRole("MANAGER"),
  validateRequest({ body: createCategorySchema }),
  asyncHandler(createHandler),
);
categoriesRouter.patch(
  "/:id",
  requireRole("MANAGER"),
  validateRequest({ params: idParamSchema, body: updateCategorySchema }),
  asyncHandler(updateHandler),
);
categoriesRouter.delete(
  "/:id",
  requireRole("MANAGER"),
  validateRequest({ params: idParamSchema }),
  asyncHandler(deleteHandler),
);
