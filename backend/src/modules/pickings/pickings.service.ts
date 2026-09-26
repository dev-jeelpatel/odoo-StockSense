import { Prisma, PickingStatus, PickingType } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { nextReference } from "../../utils/referenceGenerator";
import type {
  CreateAdjustmentInput,
  CreatePickingInput,
  ReplaceLinesInput,
  UpdatePickingInput,
} from "./pickings.schemas";

const pickingInclude = {
  warehouse: { select: { id: true, name: true, shortCode: true } },
  sourceLocation: { select: { id: true, name: true, kind: true } },
  destLocation: { select: { id: true, name: true, kind: true } },
  responsibleUser: { select: { id: true, name: true } },
  lines: {
    include: {
      product: { select: { id: true, name: true, sku: true, uom: { select: { shortCode: true } } } },
      sourceLocation: { select: { id: true, name: true } },
      destLocation: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.PickingInclude;

async function getVirtualLocation(
  tx: Prisma.TransactionClient,
  kind: "VENDOR" | "CUSTOMER" | "VIRTUAL_ADJUSTMENT",
) {
  const location = await tx.location.findFirst({ where: { kind } });
  if (!location) {
    throw AppError.badRequest(`System is missing its ${kind} location; run the seed script first`);
  }
  return location;
}

async function getDefaultStockLocation(tx: Prisma.TransactionClient, warehouseId: string) {
  const location = await tx.location.findFirst({
    where: { warehouseId, shortCode: "STOCK", kind: "INTERNAL" },
  });
  if (!location) {
    throw AppError.badRequest("Warehouse is missing its default Stock location");
  }
  return location;
}

async function resolveDocumentLocations(tx: Prisma.TransactionClient, input: CreatePickingInput) {
  if (input.pickingType === "RECEIPT") {
    const source = await getVirtualLocation(tx, "VENDOR");
    const dest = input.destLocationId
      ? await tx.location.findUnique({ where: { id: input.destLocationId } })
      : await getDefaultStockLocation(tx, input.warehouseId);
    if (!dest || dest.kind !== "INTERNAL") {
      throw AppError.badRequest("Destination must be a valid internal location", { destLocationId: "Invalid" });
    }
    return { sourceLocationId: source.id, destLocationId: dest.id };
  }

  if (input.pickingType === "DELIVERY") {
    const dest = await getVirtualLocation(tx, "CUSTOMER");
    const source = input.sourceLocationId
      ? await tx.location.findUnique({ where: { id: input.sourceLocationId } })
      : await getDefaultStockLocation(tx, input.warehouseId);
    if (!source || source.kind !== "INTERNAL") {
      throw AppError.badRequest("Source must be a valid internal location", { sourceLocationId: "Invalid" });
    }
    return { sourceLocationId: source.id, destLocationId: dest.id };
  }

  // INTERNAL
  const [source, dest] = await Promise.all([
    tx.location.findUnique({ where: { id: input.sourceLocationId! } }),
    tx.location.findUnique({ where: { id: input.destLocationId! } }),
  ]);
  if (!source || source.kind !== "INTERNAL") {
    throw AppError.badRequest("Source must be a valid internal location", { sourceLocationId: "Invalid" });
  }
  if (!dest || dest.kind !== "INTERNAL") {
    throw AppError.badRequest("Destination must be a valid internal location", { destLocationId: "Invalid" });
  }
  if (source.id === dest.id) {
    throw AppError.badRequest("Source and destination must be different locations", {
      destLocationId: "Must differ from source",
    });
  }
  return { sourceLocationId: source.id, destLocationId: dest.id };
}

function decorate<T extends { status: PickingStatus; scheduledDate: Date }>(picking: T) {
  const isLate = picking.status !== "DONE" && picking.status !== "CANCELLED" && picking.scheduledDate < new Date();
  return { ...picking, isLate };
}

export async function listPickings(filters: {
  pickingType?: PickingType;
  status?: PickingStatus;
  warehouseId?: string;
  categoryId?: string;
  search?: string;
}) {
  const pickings = await prisma.picking.findMany({
    where: {
      pickingType: filters.pickingType,
      status: filters.status,
      warehouseId: filters.warehouseId,
      lines: filters.categoryId ? { some: { product: { categoryId: filters.categoryId } } } : undefined,
      OR: filters.search
        ? [
            { reference: { contains: filters.search, mode: "insensitive" } },
            { partnerName: { contains: filters.search, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: pickingInclude,
    orderBy: { createdAt: "desc" },
  });
  return pickings.map(decorate);
}

export async function getPicking(id: string) {
  const picking = await prisma.picking.findUnique({ where: { id }, include: pickingInclude });
  if (!picking) throw AppError.notFound("Document not found");
  return decorate(picking);
}

export async function createPicking(input: CreatePickingInput) {
  const warehouse = await prisma.warehouse.findUnique({ where: { id: input.warehouseId } });
  if (!warehouse) throw AppError.badRequest("Warehouse does not exist", { warehouseId: "Not found" });

  const productIds = [...new Set(input.lines.map((l) => l.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  if (products.length !== productIds.length) {
    throw AppError.badRequest("One or more products do not exist", { lines: "Invalid product" });
  }

  return prisma.$transaction(async (tx) => {
    const { sourceLocationId, destLocationId } = await resolveDocumentLocations(tx, input);
    const reference = await nextReference(tx, warehouse.id, warehouse.shortCode, input.pickingType);

    const picking = await tx.picking.create({
      data: {
        reference,
        warehouseId: warehouse.id,
        pickingType: input.pickingType,
        partnerName: input.partnerName,
        sourceLocationId,
        destLocationId,
        status: "DRAFT",
        scheduledDate: input.scheduledDate,
        responsibleUserId: input.responsibleUserId,
        lines: {
          create: input.lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            sourceLocationId,
            destLocationId,
            status: "DRAFT",
          })),
        },
      },
      include: pickingInclude,
    });

    return decorate(picking);
  });
}

export async function updatePicking(id: string, input: UpdatePickingInput) {
  const picking = await prisma.picking.findUnique({ where: { id } });
  if (!picking) throw AppError.notFound("Document not found");
  if (picking.status === "DONE" || picking.status === "CANCELLED") {
    throw AppError.conflict("Cannot edit a document that is already done or cancelled");
  }
  const updated = await prisma.picking.update({ where: { id }, data: input, include: pickingInclude });
  return decorate(updated);
}

export async function replaceLines(id: string, input: ReplaceLinesInput) {
  const picking = await prisma.picking.findUnique({ where: { id } });
  if (!picking) throw AppError.notFound("Document not found");
  if (picking.status !== "DRAFT") {
    throw AppError.conflict("Lines can only be edited while the document is in Draft");
  }

  const productIds = [...new Set(input.lines.map((l) => l.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  if (products.length !== productIds.length) {
    throw AppError.badRequest("One or more products do not exist", { lines: "Invalid product" });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.stockMoveLine.deleteMany({ where: { pickingId: id } });
    await tx.stockMoveLine.createMany({
      data: input.lines.map((line) => ({
        pickingId: id,
        productId: line.productId,
        quantity: line.quantity,
        sourceLocationId: picking.sourceLocationId,
        destLocationId: picking.destLocationId,
        status: "DRAFT" as const,
      })),
    });
    return tx.picking.findUniqueOrThrow({ where: { id }, include: pickingInclude });
  });

  return decorate(updated);
}

export async function markReady(id: string) {
  const picking = await prisma.picking.findUnique({ where: { id }, include: { lines: true } });
  if (!picking) throw AppError.notFound("Document not found");
  if (picking.status !== "DRAFT") {
    throw AppError.conflict("Only draft documents can be marked ready");
  }

  const updated = await prisma.$transaction(async (tx) => {
    let anyWaiting = false;

    for (const line of picking.lines) {
      if (picking.pickingType === "RECEIPT") {
        await tx.stockMoveLine.update({ where: { id: line.id }, data: { status: "READY" } });
        continue;
      }

      const quant = await tx.stockQuant.findUnique({
        where: { productId_locationId: { productId: line.productId, locationId: line.sourceLocationId } },
      });
      const available = quant?.quantity ?? 0;
      const sufficient = available >= line.quantity;
      if (!sufficient) anyWaiting = true;

      await tx.stockMoveLine.update({
        where: { id: line.id },
        data: { status: sufficient ? "READY" : "WAITING" },
      });
    }

    return tx.picking.update({
      where: { id },
      data: { status: anyWaiting ? "WAITING" : "READY" },
      include: pickingInclude,
    });
  });

  return decorate(updated);
}

export async function validatePicking(id: string) {
  const picking = await prisma.picking.findUnique({ where: { id }, include: { lines: true } });
  if (!picking) throw AppError.notFound("Document not found");
  if (picking.status !== "READY" && picking.status !== "WAITING") {
    throw AppError.conflict("Only ready or waiting documents can be validated");
  }

  const updated = await prisma.$transaction(async (tx) => {
    for (const line of picking.lines) {
      if (picking.pickingType !== "RECEIPT") {
        const result = await tx.stockQuant.updateMany({
          where: { productId: line.productId, locationId: line.sourceLocationId, quantity: { gte: line.quantity } },
          data: { quantity: { decrement: line.quantity } },
        });
        if (result.count === 0) {
          throw AppError.conflict(
            `Insufficient stock for one or more products at the source location. Validation aborted.`,
          );
        }
      }

      await tx.stockQuant.upsert({
        where: { productId_locationId: { productId: line.productId, locationId: line.destLocationId } },
        create: { productId: line.productId, locationId: line.destLocationId, quantity: line.quantity },
        update: { quantity: { increment: line.quantity } },
      });

      await tx.stockMoveLine.update({ where: { id: line.id }, data: { status: "DONE", doneAt: new Date() } });
    }

    return tx.picking.update({
      where: { id },
      data: { status: "DONE", doneDate: new Date() },
      include: pickingInclude,
    });
  });

  return decorate(updated);
}

export async function cancelPicking(id: string) {
  const picking = await prisma.picking.findUnique({ where: { id } });
  if (!picking) throw AppError.notFound("Document not found");
  if (picking.status === "DONE" || picking.status === "CANCELLED") {
    throw AppError.conflict("Cannot cancel a document that is already done or cancelled");
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.stockMoveLine.updateMany({ where: { pickingId: id }, data: { status: "CANCELLED" } });
    return tx.picking.update({ where: { id }, data: { status: "CANCELLED" }, include: pickingInclude });
  });

  return decorate(updated);
}

export async function createAdjustment(input: CreateAdjustmentInput) {
  const warehouse = await prisma.warehouse.findUnique({ where: { id: input.warehouseId } });
  if (!warehouse) throw AppError.badRequest("Warehouse does not exist", { warehouseId: "Not found" });

  const location = await prisma.location.findUnique({ where: { id: input.locationId } });
  if (!location || location.kind !== "INTERNAL" || location.warehouseId !== input.warehouseId) {
    throw AppError.badRequest("Location must be a valid internal location in this warehouse", {
      locationId: "Invalid",
    });
  }

  const productIds = [...new Set(input.lines.map((l) => l.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  if (products.length !== productIds.length) {
    throw AppError.badRequest("One or more products do not exist", { lines: "Invalid product" });
  }

  const existingQuants = await prisma.stockQuant.findMany({
    where: { locationId: input.locationId, productId: { in: productIds } },
  });
  const onHandByProduct = new Map(existingQuants.map((q) => [q.productId, q.quantity]));

  const changes = input.lines
    .map((line) => ({ ...line, onHand: onHandByProduct.get(line.productId) ?? 0 }))
    .filter((line) => line.countedQuantity !== line.onHand);

  if (changes.length === 0) {
    throw AppError.badRequest("Counted quantities match current stock; nothing to adjust");
  }

  const picking = await prisma.$transaction(async (tx) => {
    const adjustmentLocation = await getVirtualLocation(tx, "VIRTUAL_ADJUSTMENT");
    const reference = await nextReference(tx, warehouse.id, warehouse.shortCode, "ADJUSTMENT");

    const created = await tx.picking.create({
      data: {
        reference,
        warehouseId: warehouse.id,
        pickingType: "ADJUSTMENT",
        partnerName: "Stock count",
        sourceLocationId: adjustmentLocation.id,
        destLocationId: location.id,
        status: "DONE",
        scheduledDate: input.scheduledDate ?? new Date(),
        doneDate: new Date(),
      },
    });

    for (const change of changes) {
      const delta = change.countedQuantity - change.onHand;
      const increasing = delta > 0;

      await tx.stockMoveLine.create({
        data: {
          pickingId: created.id,
          productId: change.productId,
          quantity: Math.abs(delta),
          sourceLocationId: increasing ? adjustmentLocation.id : location.id,
          destLocationId: increasing ? location.id : adjustmentLocation.id,
          status: "DONE",
          doneAt: new Date(),
        },
      });

      await tx.stockQuant.upsert({
        where: { productId_locationId: { productId: change.productId, locationId: location.id } },
        create: { productId: change.productId, locationId: location.id, quantity: change.countedQuantity },
        update: { quantity: change.countedQuantity },
      });
    }

    return tx.picking.findUniqueOrThrow({ where: { id: created.id }, include: pickingInclude });
  });

  return decorate(picking);
}
