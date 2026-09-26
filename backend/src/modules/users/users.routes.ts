import { Router } from "express";
import { prisma } from "../../config/prisma";
import { jwtAuth, requireRole, AuthenticatedRequest } from "../../middleware/jwtAuth";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/AppError";
import { z } from "zod";
import { validateRequest } from "../../middleware/validateRequest";
import bcrypt from "bcryptjs";

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

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

usersRouter.post(
  "/me/change-password",
  jwtAuth,
  validateRequest({ body: changePasswordSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw AppError.notFound("User not found");
    const valid = await bcrypt.compare(req.body.currentPassword, user.passwordHash);
    if (!valid) throw AppError.badRequest("Current password is incorrect", { currentPassword: "Incorrect password" });
    const hash = await bcrypt.hash(req.body.newPassword, 12);
    await prisma.user.update({ where: { id: req.user!.id }, data: { passwordHash: hash } });
    res.json({ message: "Password changed successfully" });
  }),
);

usersRouter.get(
  "/",
  jwtAuth,
  requireRole("MANAGER"),
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { name: "asc" },
    });
    res.json(users);
  }),
);

const updateRoleSchema = z.object({
  role: z.enum(["MANAGER", "STAFF"]),
});

usersRouter.patch(
  "/:id/role",
  jwtAuth,
  requireRole("MANAGER"),
  validateRequest({ body: updateRoleSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (req.params.id === req.user!.id) throw AppError.badRequest("You cannot change your own role");
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: req.body.role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.json(user);
  }),
);

usersRouter.delete(
  "/:id",
  jwtAuth,
  requireRole("MANAGER"),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (req.params.id === req.user!.id) throw AppError.badRequest("You cannot delete your own account");
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }),
);
