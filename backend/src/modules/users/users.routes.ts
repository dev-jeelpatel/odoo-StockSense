import { Router } from "express";
import { prisma } from "../../config/prisma";
import { jwtAuth, AuthenticatedRequest } from "../../middleware/jwtAuth";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/AppError";
import { z } from "zod";
import { validateRequest } from "../../middleware/validateRequest";

export const usersRouter = Router();

usersRouter.get(
  "/me",
  jwtAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!user) throw AppError.notFound("User not found");
    res.json(user);
  }),
);

const updateMeSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
});

usersRouter.patch(
  "/me",
  jwtAuth,
  validateRequest({ body: updateMeSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name: req.body.name },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.json(user);
  }),
);
