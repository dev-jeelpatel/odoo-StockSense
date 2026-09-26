import { Router } from "express";
import { jwtAuth } from "../../middleware/jwtAuth";
import { asyncHandler } from "../../utils/asyncHandler";
import { getKpis } from "./dashboard.service";

export const dashboardRouter = Router();

dashboardRouter.use(jwtAuth);

dashboardRouter.get(
  "/kpis",
  asyncHandler(async (_req, res) => {
    res.json(await getKpis());
  }),
);
