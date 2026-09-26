import { Router } from "express";
import { jwtAuth } from "../../middleware/jwtAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { asyncHandler } from "../../utils/asyncHandler";
import { idParamSchema } from "../../common/schemas";
import {
  createAdjustmentSchema,
  createPickingSchema,
  listPickingsQuerySchema,
  replaceLinesSchema,
  updatePickingSchema,
} from "./pickings.schemas";
import {
  cancelHandler,
  createAdjustmentHandler,
  createHandler,
  getHandler,
  listHandler,
  markReadyHandler,
  replaceLinesHandler,
  updateHandler,
  validateHandler,
} from "./pickings.controller";

export const pickingsRouter = Router();

pickingsRouter.use(jwtAuth);

pickingsRouter.get("/", validateRequest({ query: listPickingsQuerySchema }), asyncHandler(listHandler));
pickingsRouter.post(
  "/adjustments",
  validateRequest({ body: createAdjustmentSchema }),
  asyncHandler(createAdjustmentHandler),
);
pickingsRouter.post("/", validateRequest({ body: createPickingSchema }), asyncHandler(createHandler));
pickingsRouter.get("/:id", validateRequest({ params: idParamSchema }), asyncHandler(getHandler));
pickingsRouter.patch(
  "/:id",
  validateRequest({ params: idParamSchema, body: updatePickingSchema }),
  asyncHandler(updateHandler),
);
pickingsRouter.put(
  "/:id/lines",
  validateRequest({ params: idParamSchema, body: replaceLinesSchema }),
  asyncHandler(replaceLinesHandler),
);
pickingsRouter.post("/:id/mark-ready", validateRequest({ params: idParamSchema }), asyncHandler(markReadyHandler));
pickingsRouter.post("/:id/validate", validateRequest({ params: idParamSchema }), asyncHandler(validateHandler));
pickingsRouter.post("/:id/cancel", validateRequest({ params: idParamSchema }), asyncHandler(cancelHandler));
