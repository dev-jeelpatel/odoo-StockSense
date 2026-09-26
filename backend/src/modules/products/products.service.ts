import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { nextReference } from "../../utils/referenceGenerator";
import type { CreateProductInput, UpdateProductInput } from "./products.schemas";

export function listProducts(filters: { search?: string; categoryId?: string }) {
  return prisma.product.findMany({
    where: {
      categoryId: filters.categoryId,
      OR: filters.search
        ? [
            { name: { contains: filters.search, mode: "insensitive" } },
            { sku: { contains: filters.search, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: {
      category: { select: { id: true, name: true } },
      uom: { select: { id: true, name: true, shortCode: true } },
      quants: { select: { quantity: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      uom: { select: { id: true, name: true, shortCode: true } },
      quants: {
        where: { quantity: { gt: 0 } },
        include: { location: { include: { warehouse: { select: { id: true, name: true, shortCode: true } } } } },
      },
    },
  });
  if (!product) throw AppError.notFound("Product not found");
  return product;
}

async function assertCategoryAndUom(categoryId: string, uomId: string) {
  const [category, uom] = await Promise.all([
    prisma.productCategory.findUnique({ where: { id: categoryId } }),
    prisma.unitOfMeasure.findUnique({ where: { id: uomId } }),
  ]);
  if (!category) throw AppError.badRequest("Category does not exist", { categoryId: "Not found" });
  if (!uom) throw AppError.badRequest("Unit of measure does not exist", { uomId: "Not found" });
}

export async function createProduct(input: CreateProductInput) {
  if (input.reorderMax > 0 && input.reorderMax < input.reorderMin) {
    throw AppError.badRequest("Reorder max cannot be lower than reorder min", {
      reorderMax: "Must be greater than or equal to reorder min",
    });
  }

  const existingSku = await prisma.product.findUnique({ where: { sku: input.sku } });
  if (existingSku) {
    throw AppError.conflict("A product with this SKU already exists", { sku: "Already in use" });
  }

  await assertCategoryAndUom(input.categoryId, input.uomId);

  if (input.initialStock) {
    const location = await prisma.location.findUnique({ where: { id: input.initialStock.locationId } });
    if (!location || location.kind !== "INTERNAL") {
      throw AppError.badRequest("Initial stock location must be a valid internal location", {
        "initialStock.locationId": "Invalid location",
      });
    }
  }

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name: input.name,
        sku: input.sku,
        categoryId: input.categoryId,
        uomId: input.uomId,
        costPerUnit: input.costPerUnit,
        reorderMin: input.reorderMin,
        reorderMax: input.reorderMax,
      },
    });

    if (input.initialStock) {
      const destLocation = await tx.location.findUniqueOrThrow({ where: { id: input.initialStock.locationId } });
      const adjustmentSource = await tx.location.findFirst({ where: { kind: "VIRTUAL_ADJUSTMENT" } });
      if (!adjustmentSource) {
        throw AppError.badRequest("System is missing its adjustment location; run the seed script first");
      }

      const warehouse = await tx.warehouse.findUniqueOrThrow({ where: { id: destLocation.warehouseId! } });
      const reference = await nextReference(tx, warehouse.id, warehouse.shortCode, "ADJUSTMENT");

      const picking = await tx.picking.create({
        data: {
          reference,
          warehouseId: warehouse.id,
          pickingType: "ADJUSTMENT",
          partnerName: "Initial stock",
          sourceLocationId: adjustmentSource.id,
          destLocationId: destLocation.id,
          status: "DONE",
          scheduledDate: new Date(),
          doneDate: new Date(),
        },
      });

      await tx.stockMoveLine.create({
        data: {
          pickingId: picking.id,
          productId: product.id,
          quantity: input.initialStock.quantity,
          sourceLocationId: adjustmentSource.id,
          destLocationId: destLocation.id,
          status: "DONE",
          doneAt: new Date(),
        },
      });

      await tx.stockQuant.upsert({
        where: { productId_locationId: { productId: product.id, locationId: destLocation.id } },
        create: { productId: product.id, locationId: destLocation.id, quantity: input.initialStock.quantity },
        update: { quantity: { increment: input.initialStock.quantity } },
      });
    }

    return product;
  });
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  await getProduct(id);
  if (input.categoryId || input.uomId) {
    await assertCategoryAndUom(
      input.categoryId ?? (await prisma.product.findUniqueOrThrow({ where: { id } })).categoryId,
      input.uomId ?? (await prisma.product.findUniqueOrThrow({ where: { id } })).uomId,
    );
  }
  return prisma.product.update({ where: { id }, data: input });
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { _count: { select: { moveLines: true } }, quants: true },
  });
  if (!product) throw AppError.notFound("Product not found");
  const hasStock = product.quants.some((q) => q.quantity > 0);
  if (hasStock || product._count.moveLines > 0) {
    throw AppError.conflict("Cannot delete a product that has stock or recorded movements");
  }
  await prisma.product.delete({ where: { id } });
}
