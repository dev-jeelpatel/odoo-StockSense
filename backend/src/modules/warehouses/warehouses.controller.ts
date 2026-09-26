import { Request, Response } from "express";
import * as warehousesService from "./warehouses.service";

export async function listHandler(_req: Request, res: Response) {
  res.json(await warehousesService.listWarehouses());
}

export async function getHandler(req: Request, res: Response) {
  res.json(await warehousesService.getWarehouse(req.params.id));
}

export async function createHandler(req: Request, res: Response) {
  res.status(201).json(await warehousesService.createWarehouse(req.body));
}

export async function updateHandler(req: Request, res: Response) {
  res.json(await warehousesService.updateWarehouse(req.params.id, req.body));
}

export async function deleteHandler(req: Request, res: Response) {
  await warehousesService.deleteWarehouse(req.params.id);
  res.status(204).send();
}
