import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import type { CreateLocationInput, UpdateLocationInput } from "./locations.schemas";

export function listLocations(warehouseId?: string) {
  return prisma.location.findMany({
    where: warehouseId ? { warehouseId } : undefined,
    include: { warehouse: { select: { id: true, name: true, shortCode: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getLocation(id: string) {
  const location = await prisma.location.findUnique({
    where: { id },
    include: { warehouse: { select: { id: true, name: true, shortCode: true } }, childLocations: true },
  });
  if (!location) throw AppError.notFound("Location not found");
  return location;
}

export async function createLocation(input: CreateLocationInput) {
  const warehouse = await prisma.warehouse.findUnique({ where: { id: input.warehouseId } });
  if (!warehouse) throw AppError.badRequest("Warehouse does not exist", { warehouseId: "Not found" });

  if (input.parentLocationId) {
    const parent = await prisma.location.findUnique({ where: { id: input.parentLocationId } });
    if (!parent || parent.warehouseId !== input.warehouseId) {
      throw AppError.badRequest("Parent location must belong to the same warehouse", {
        parentLocationId: "Invalid parent",
      });
    }
  }

  const existing = await prisma.location.findUnique({
    where: { warehouseId_shortCode: { warehouseId: input.warehouseId, shortCode: input.shortCode } },
  });
  if (existing) {
    throw AppError.conflict("A location with this short code already exists in this warehouse", {
      shortCode: "Already in use",
    });
  }

  return prisma.location.create({
    data: {
      warehouseId: input.warehouseId,
      name: input.name,
      shortCode: input.shortCode,
      kind: "INTERNAL",
      parentLocationId: input.parentLocationId ?? null,
    },
  });
}

export async function updateLocation(id: string, input: UpdateLocationInput) {
  const location = await getLocation(id);
  if (location.kind !== "INTERNAL") {
    throw AppError.forbidden("System locations cannot be edited");
  }
  if (input.parentLocationId === id) {
    throw AppError.badRequest("A location cannot be its own parent", { parentLocationId: "Invalid parent" });
  }
  return prisma.location.update({ where: { id }, data: input });
}

export async function deleteLocation(id: string) {
  const location = await prisma.location.findUnique({
    where: { id },
    include: { _count: { select: { quants: true, childLocations: true } } },
  });
  if (!location) throw AppError.notFound("Location not found");
  if (location.kind !== "INTERNAL") {
    throw AppError.forbidden("System locations cannot be deleted");
  }
  if (location._count.childLocations > 0) {
    throw AppError.conflict("Cannot delete a location that has sub-locations");
  }
  const hasStock = await prisma.stockQuant.findFirst({ where: { locationId: id, quantity: { gt: 0 } } });
  if (hasStock) {
    throw AppError.conflict("Cannot delete a location that currently holds stock");
  }
  await prisma.location.delete({ where: { id } });
}
