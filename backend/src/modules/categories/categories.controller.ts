import { Request, Response } from "express";
import * as categoriesService from "./categories.service";

export async function listHandler(_req: Request, res: Response) {
  res.json(await categoriesService.listCategories());
}

export async function getHandler(req: Request, res: Response) {
  res.json(await categoriesService.getCategory(req.params.id));
}

export async function createHandler(req: Request, res: Response) {
  res.status(201).json(await categoriesService.createCategory(req.body));
}

export async function updateHandler(req: Request, res: Response) {
  res.json(await categoriesService.updateCategory(req.params.id, req.body));
}

export async function deleteHandler(req: Request, res: Response) {
  await categoriesService.deleteCategory(req.params.id);
  res.status(204).send();
}
