import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import type { CreateWarehouseInput, UpdateWarehouseInput } from "./warehouses.schemas";

export function listWarehouses() {
  return prisma.warehouse.findMany({
    include: { _count: { select: { locations: true, pickings: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getWarehouse(id: string) {
  const warehouse = await prisma.warehouse.findUnique({
    where: { id },
    include: { locations: { orderBy: { name: "asc" } } },
  });
  if (!warehouse) throw AppError.notFound("Warehouse not found");
  return warehouse;
}

export async function createWarehouse(input: CreateWarehouseInput) {
  const existing = await prisma.warehouse.findUnique({ where: { shortCode: input.shortCode } });
  if (existing) {
    throw AppError.conflict("A warehouse with this short code already exists", {
      shortCode: "Already in use",
    });
  }

  return prisma.$transaction(async (tx) => {
    const warehouse = await tx.warehouse.create({
      data: { name: input.name, shortCode: input.shortCode, address: input.address },
    });

    await tx.location.create({
      data: {
        warehouseId: warehouse.id,
        name: "Stock",
        shortCode: "STOCK",
        kind: "INTERNAL",
      },
    });

    return warehouse;
  });
}

export async function updateWarehouse(id: string, input: UpdateWarehouseInput) {
  await getWarehouse(id);
  return prisma.warehouse.update({ where: { id }, data: input });
}

export async function deleteWarehouse(id: string) {
  const warehouse = await prisma.warehouse.findUnique({
    where: { id },
    include: { _count: { select: { pickings: true } } },
  });
  if (!warehouse) throw AppError.notFound("Warehouse not found");
  if (warehouse._count.pickings > 0) {
    throw AppError.conflict("Cannot delete a warehouse that has operations recorded against it");
  }
  await prisma.warehouse.delete({ where: { id } });
}
