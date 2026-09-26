import { prisma } from "../../config/prisma";

const PENDING_STATUSES = ["DRAFT", "WAITING", "READY"] as const;

export async function getKpis() {
  const [productsInStock, products, pendingReceipts, pendingDeliveries, pendingInternalTransfers] =
    await Promise.all([
      prisma.stockQuant.groupBy({ by: ["productId"], where: { quantity: { gt: 0 } } }),
      prisma.product.findMany({ where: { reorderMin: { gt: 0 } }, include: { quants: { select: { quantity: true } } } }),
      prisma.picking.count({ where: { pickingType: "RECEIPT", status: { in: [...PENDING_STATUSES] } } }),
      prisma.picking.count({ where: { pickingType: "DELIVERY", status: { in: [...PENDING_STATUSES] } } }),
      prisma.picking.count({ where: { pickingType: "INTERNAL", status: { in: [...PENDING_STATUSES] } } }),
    ]);

  let lowStock = 0;
  let outOfStock = 0;
  for (const product of products) {
    const onHand = product.quants.reduce((sum, q) => sum + q.quantity, 0);
    if (onHand <= 0) outOfStock += 1;
    else if (onHand <= product.reorderMin) lowStock += 1;
  }

  return {
    totalProductsInStock: productsInStock.length,
    lowStockItems: lowStock,
    outOfStockItems: outOfStock,
    pendingReceipts,
    pendingDeliveries,
    internalTransfersScheduled: pendingInternalTransfers,
  };
}
