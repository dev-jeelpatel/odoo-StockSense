import { prisma } from "../../config/prisma";
import type { ListMovesQuery } from "./moves.schemas";

function directionOf(sourceKind: string, destKind: string): "IN" | "OUT" | "INTERNAL" {
  const sourceInternal = sourceKind === "INTERNAL";
  const destInternal = destKind === "INTERNAL";
  if (!sourceInternal && destInternal) return "IN";
  if (sourceInternal && !destInternal) return "OUT";
  return "INTERNAL";
}

export async function listMoves(filters: ListMovesQuery) {
  const lines = await prisma.stockMoveLine.findMany({
    where: {
      status: "DONE",
      productId: filters.productId,
      OR: filters.locationId
        ? [{ sourceLocationId: filters.locationId }, { destLocationId: filters.locationId }]
        : undefined,
      picking: {
        warehouseId: filters.warehouseId,
        OR: filters.search
          ? [
              { reference: { contains: filters.search, mode: "insensitive" } },
              { partnerName: { contains: filters.search, mode: "insensitive" } },
            ]
          : undefined,
      },
      doneAt: {
        gte: filters.dateFrom,
        lte: filters.dateTo,
      },
    },
    include: {
      product: { select: { id: true, name: true, sku: true, uom: { select: { shortCode: true } } } },
      sourceLocation: { select: { id: true, name: true, kind: true } },
      destLocation: { select: { id: true, name: true, kind: true } },
      picking: {
        select: {
          id: true,
          reference: true,
          pickingType: true,
          partnerName: true,
          warehouse: { select: { id: true, name: true, shortCode: true } },
        },
      },
    },
    orderBy: { doneAt: "desc" },
  });

  return lines.map((line) => ({
    ...line,
    direction: directionOf(line.sourceLocation.kind, line.destLocation.kind),
  }));
}
