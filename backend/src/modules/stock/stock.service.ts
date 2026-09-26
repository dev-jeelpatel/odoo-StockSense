import { prisma } from "../../config/prisma";
import type { ListQuantsQuery } from "./stock.schemas";

export function listQuants(filters: ListQuantsQuery) {
  return prisma.stockQuant.findMany({
    where: {
      productId: filters.productId,
      locationId: filters.locationId,
      quantity: { gt: 0 },
      location: filters.warehouseId ? { warehouseId: filters.warehouseId } : undefined,
    },
    include: {
      product: { select: { id: true, name: true, sku: true, uom: { select: { shortCode: true } } } },
      location: {
        select: { id: true, name: true, warehouse: { select: { id: true, name: true, shortCode: true } } },
      },
    },
    orderBy: { quantity: "desc" },
  });
}

export async function listReorderAlerts() {
  const products = await prisma.product.findMany({
    where: { reorderMin: { gt: 0 } },
    include: { quants: { select: { quantity: true } }, uom: { select: { shortCode: true } } },
  });

  return products
    .map((product) => {
      const onHand = product.quants.reduce((sum, q) => sum + q.quantity, 0);
      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        uom: product.uom.shortCode,
        onHand,
        reorderMin: product.reorderMin,
        reorderMax: product.reorderMax,
        status: onHand <= 0 ? ("OUT_OF_STOCK" as const) : ("LOW_STOCK" as const),
      };
    })
    .filter((p) => p.onHand <= p.reorderMin);
}
