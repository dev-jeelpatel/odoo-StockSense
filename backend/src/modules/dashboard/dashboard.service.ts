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

export async function getReorderAlerts() {
  const products = await prisma.product.findMany({
    where: { reorderMin: { gt: 0 } },
    include: {
      quants: { select: { quantity: true } },
      uom: { select: { shortCode: true } },
    },
    orderBy: { name: "asc" },
  });

  const alerts = [];
  for (const p of products) {
    const onHand = p.quants.reduce((s, q) => s + q.quantity, 0);
    if (onHand <= 0) {
      alerts.push({ id: p.id, name: p.name, sku: p.sku, uom: p.uom.shortCode, onHand, reorderMin: p.reorderMin, reorderMax: p.reorderMax, status: "OUT_OF_STOCK" });
    } else if (onHand <= p.reorderMin) {
      alerts.push({ id: p.id, name: p.name, sku: p.sku, uom: p.uom.shortCode, onHand, reorderMin: p.reorderMin, reorderMax: p.reorderMax, status: "LOW_STOCK" });
    }
  }
  return alerts;
}

export async function getMovementChartData() {
  const days = 7;
  const now = new Date();
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);

    const [receipts, deliveries] = await Promise.all([
      prisma.picking.count({ where: { pickingType: "RECEIPT", doneDate: { gte: day, lt: next } } }),
      prisma.picking.count({ where: { pickingType: "DELIVERY", doneDate: { gte: day, lt: next } } }),
    ]);
    result.push({
      date: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      receipts,
      deliveries,
    });
  }
  return result;
}
