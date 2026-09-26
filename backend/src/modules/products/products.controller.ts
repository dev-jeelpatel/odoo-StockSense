import { Request, Response } from "express";
import * as productsService from "./products.service";

export async function listHandler(req: Request, res: Response) {
  const { search, categoryId } = req.query as { search?: string; categoryId?: string };
  res.json(await productsService.listProducts({ search, categoryId }));
}

export async function getHandler(req: Request, res: Response) {
  res.json(await productsService.getProduct(req.params.id));
}

export async function createHandler(req: Request, res: Response) {
  res.status(201).json(await productsService.createProduct(req.body));
}

export async function updateHandler(req: Request, res: Response) {
  res.json(await productsService.updateProduct(req.params.id, req.body));
}

export async function deleteHandler(req: Request, res: Response) {
  await productsService.deleteProduct(req.params.id);
  res.status(204).send();
}
