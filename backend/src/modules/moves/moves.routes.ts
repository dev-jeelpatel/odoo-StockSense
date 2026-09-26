import { Router } from "express";
import { jwtAuth } from "../../middleware/jwtAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { asyncHandler } from "../../utils/asyncHandler";
import { listMovesQuerySchema } from "./moves.schemas";
import { listMoves } from "./moves.service";

export const movesRouter = Router();

movesRouter.use(jwtAuth);

movesRouter.get(
  "/",
  validateRequest({ query: listMovesQuerySchema }),
  asyncHandler(async (req, res) => {
    res.json(await listMoves(req.query as never));
  }),
);
