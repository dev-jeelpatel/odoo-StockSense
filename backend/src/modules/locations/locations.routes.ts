import { Router } from "express";
import { jwtAuth, requireRole } from "../../middleware/jwtAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { asyncHandler } from "../../utils/asyncHandler";
import { idParamSchema } from "../../common/schemas";
import { createLocationSchema, listLocationsQuerySchema, updateLocationSchema } from "./locations.schemas";
import { createHandler, deleteHandler, getHandler, listHandler, updateHandler } from "./locations.controller";

export const locationsRouter = Router();

locationsRouter.use(jwtAuth);

locationsRouter.get("/", validateRequest({ query: listLocationsQuerySchema }), asyncHandler(listHandler));
locationsRouter.get("/:id", validateRequest({ params: idParamSchema }), asyncHandler(getHandler));
locationsRouter.post(
  "/",
  requireRole("MANAGER"),
  validateRequest({ body: createLocationSchema }),
  asyncHandler(createHandler),
);
locationsRouter.patch(
  "/:id",
  requireRole("MANAGER"),
  validateRequest({ params: idParamSchema, body: updateLocationSchema }),
  asyncHandler(updateHandler),
);
locationsRouter.delete(
  "/:id",
  requireRole("MANAGER"),
  validateRequest({ params: idParamSchema }),
  asyncHandler(deleteHandler),
);
