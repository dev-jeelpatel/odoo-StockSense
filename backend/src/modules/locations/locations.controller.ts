import { Request, Response } from "express";
import * as locationsService from "./locations.service";

export async function listHandler(req: Request, res: Response) {
  const { warehouseId } = req.query as { warehouseId?: string };
  res.json(await locationsService.listLocations(warehouseId));
}

export async function getHandler(req: Request, res: Response) {
  res.json(await locationsService.getLocation(req.params.id));
}

export async function createHandler(req: Request, res: Response) {
  res.status(201).json(await locationsService.createLocation(req.body));
}

export async function updateHandler(req: Request, res: Response) {
  res.json(await locationsService.updateLocation(req.params.id, req.body));
}

export async function deleteHandler(req: Request, res: Response) {
  await locationsService.deleteLocation(req.params.id);
  res.status(204).send();
}
