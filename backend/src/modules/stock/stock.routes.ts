import { Router } from "express";
import { jwtAuth } from "../../middleware/jwtAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { asyncHandler } from "../../utils/asyncHandler";
import { listQuantsQuerySchema } from "./stock.schemas";
import { listQuants, listReorderAlerts } from "./stock.service";

export const stockRouter = Router();

stockRouter.use(jwtAuth);

stockRouter.get(
  "/quants",
  validateRequest({ query: listQuantsQuerySchema }),
  asyncHandler(async (req, res) => {
    res.json(await listQuants(req.query as never));
  }),
);

stockRouter.get(
  "/reorder-alerts",
  asyncHandler(async (_req, res) => {
    res.json(await listReorderAlerts());
  }),
);
