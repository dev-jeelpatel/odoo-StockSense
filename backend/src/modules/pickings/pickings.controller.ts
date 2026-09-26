import { Request, Response } from "express";
import { PickingStatus, PickingType } from "@prisma/client";
import type { AuthenticatedRequest } from "../../middleware/jwtAuth";
import * as pickingsService from "./pickings.service";

export async function listHandler(req: Request, res: Response) {
  const { pickingType, status, warehouseId, categoryId, search } = req.query as {
    pickingType?: PickingType;
    status?: PickingStatus;
    warehouseId?: string;
    categoryId?: string;
    search?: string;
  };
  res.json(await pickingsService.listPickings({ pickingType, status, warehouseId, categoryId, search }));
}

export async function getHandler(req: Request, res: Response) {
  res.json(await pickingsService.getPicking(req.params.id));
}

export async function createHandler(req: AuthenticatedRequest, res: Response) {
  const input = { ...req.body, responsibleUserId: req.body.responsibleUserId ?? req.user!.id };
  res.status(201).json(await pickingsService.createPicking(input));
}

export async function updateHandler(req: Request, res: Response) {
  res.json(await pickingsService.updatePicking(req.params.id, req.body));
}

export async function replaceLinesHandler(req: Request, res: Response) {
  res.json(await pickingsService.replaceLines(req.params.id, req.body));
}

export async function markReadyHandler(req: Request, res: Response) {
  res.json(await pickingsService.markReady(req.params.id));
}

export async function validateHandler(req: Request, res: Response) {
  res.json(await pickingsService.validatePicking(req.params.id));
}

export async function cancelHandler(req: Request, res: Response) {
  res.json(await pickingsService.cancelPicking(req.params.id));
}

export async function createAdjustmentHandler(req: Request, res: Response) {
  res.status(201).json(await pickingsService.createAdjustment(req.body));
}
