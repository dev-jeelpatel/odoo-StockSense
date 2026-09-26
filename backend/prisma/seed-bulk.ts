/**
 * Adds a large, realistic demo dataset on top of the base seed (prisma/seed.ts):
 * ~130 products across 8 categories, a second warehouse, and ~80 receipts/
 * deliveries/internal transfers/adjustments spread over the last 45 days so
 * the dashboard, kanban boards, and move-history ledger all have real volume
 * to show instead of the handful of records from the minimal base seed.
 *
 * Idempotent: products are upserted by SKU, and the operational-history
 * generator skips itself if the database already has a large number of
 * pickings, so re-running this script doesn't endlessly pile up data.
 */
import { PickingType, PrismaClient } from "@prisma/client";
import { nextReference } from "../src/utils/referenceGenerator";

const prisma = new PrismaClient();

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function randomDate(daysBack: number, daysForward: number): Date {
  const now = Date.now();
  const offsetMs = randomInt(-daysBack, daysForward) * 24 * 60 * 60 * 1000;
  return new Date(now + offsetMs);
}

const VENDORS = [
  "Azure Interior",
  "Acme Supplies",
  "Global Traders",
  "BuildRight Materials",
  "Prime Distributors",
  "Metro Wholesale",
  "Apex Industrial",
  "Nova Logistics Co",
];

const CUSTOMERS = [
  "Skyline Retailers",
  "Urban Furnishings",
  "Bright Electronics",
  "Greenfield Corp",
  "Summit Enterprises",
  "Coastal Traders",
  "Horizon Mart",
  "Test Customer",
];

interface ProductSeed {
  name: string;
  sku: string;
  category: string;
  uom: string;
  costRange: [number, number];
  reorderMin: number;
  reorderMax: number;
}

const CATALOG: Record<string, { uom: string; costRange: [number, number]; items: string[] }> = {
  "Raw Materials": {
    uom: "KG",
    costRange: [40, 900],
    items: [
      "Steel Rods",
      "Aluminum Sheets",
      "Copper Wire",
      "PVC Pipes",
      "Rubber Sheets",
      "Wood Planks",
      "Glass Panels",
      "Cement Bags",
      "Fine Sand",
      "Gravel",
      "Iron Rods",
      "Brass Fittings",
      "Plastic Granules",
      "Fiberglass Rolls",
      "Silicone Sealant",
      "Welding Rods",
      "Paint Cans",
      "Adhesive Tubes",
      "Insulation Foam",
      "Ceramic Tiles",
    ],
  },
  "Finished Goods": {
    uom: "PCS",
    costRange: [1500, 25000],
    items: [
      "Office Chair",
      "Office Desk",
      "Bookshelf",
      "Filing Cabinet",
      "Conference Table",
      "Sofa Set",
      "Dining Table",
      "Bed Frame",
      "Wardrobe",
      "Study Table",
      "Recliner Chair",
      "Coffee Table",
      "TV Stand",
      "Shoe Rack",
      "Wall Mirror",
      "Table Lamp",
      "Floor Lamp",
      "Cushion Set",
      "Curtain Set",
      "Area Rug",
    ],
  },
  Electronics: {
    uom: "PCS",
    costRange: [500, 60000],
    items: [
      "Laptop",
      "Desktop Monitor",
      "Wireless Mouse",
      "Mechanical Keyboard",
      "USB Hub",
      "HDMI Cable",
      "Power Bank",
      "Bluetooth Speaker",
      "Webcam",
      "Wi-Fi Router",
      "Network Switch",
      "External Hard Drive",
      "SSD Drive",
      "RAM Module",
      "Graphics Card",
      "Laser Printer",
      "Document Scanner",
      "Projector",
      "Tablet",
      "Smartphone",
    ],
  },
  "Packaging Materials": {
    uom: "BOX",
    costRange: [50, 1200],
    items: [
      "Corrugated Boxes",
      "Bubble Wrap Rolls",
      "Packing Tape",
      "Shrink Wrap",
      "Foam Sheets",
      "Cardboard Sheets",
      "Stretch Film",
      "Packing Peanuts",
      "Poly Mailers",
      "Wooden Crates",
      "Pallet Wrap",
      "Label Rolls",
      "Zip Bags",
      "Padded Envelopes",
      "Void Fill Paper",
    ],
  },
  "Office Supplies": {
    uom: "PCS",
    costRange: [10, 800],
    items: [
      "Ballpoint Pens",
      "Notebooks",
      "Stapler",
      "Sticky Notes",
      "Whiteboard Markers",
      "Paper Clips",
      "File Folders",
      "Highlighters",
      "Correction Tape",
      "Desk Organizer",
      "Calculator",
      "Scissors",
      "Rulers",
      "Envelopes",
      "Printer Paper Ream",
    ],
  },
  "Tools & Equipment": {
    uom: "PCS",
    costRange: [200, 15000],
    items: [
      "Cordless Drill",
      "Claw Hammer",
      "Screwdriver Set",
      "Wrench Set",
      "Measuring Tape",
      "Safety Helmet",
      "Safety Gloves",
      "Angle Grinder",
      "Circular Saw",
      "Step Ladder",
      "Tool Box",
      "Pliers Set",
      "Spirit Level",
      "Utility Knife",
      "Air Compressor",
    ],
  },
  Consumables: {
    uom: "L",
    costRange: [80, 2500],
    items: [
      "Engine Oil",
      "Hydraulic Fluid",
      "Coolant",
      "Cleaning Solvent",
      "Lubricant Spray",
      "Hand Sanitizer",
      "Dish Soap",
      "Floor Cleaner",
      "Glass Cleaner",
      "Industrial Degreaser",
    ],
  },
  "Spare Parts": {
    uom: "PCS",
    costRange: [150, 12000],
    items: [
      "Ball Bearings",
      "Conveyor Belt",
      "Motor Gearbox",
      "Hydraulic Pump",
      "Pressure Valve",
      "Drive Chain",
      "Sprocket Wheel",
      "V-Belt",
      "Filter Cartridge",
      "Sensor Module",
      "Relay Switch",
      "Circuit Breaker",
      "Fuse Box",
      "Control Panel",
      "Actuator Arm",
    ],
  },
};

function buildCatalog(): ProductSeed[] {
  const products: ProductSeed[] = [];
  for (const [category, def] of Object.entries(CATALOG)) {
    def.items.forEach((name, index) => {
      const prefix = category
        .split(/\s+/)[0]
        .replace(/[^A-Za-z]/g, "")
        .slice(0, 4)
        .toUpperCase();
      products.push({
        name,
        sku: `${prefix}-${String(index + 1).padStart(3, "0")}`,
        category,
        uom: def.uom,
        costRange: def.costRange,
        reorderMin: randomInt(5, 30),
        reorderMax: randomInt(50, 300),
      });
    });
  }
  return products;
}

async function ensureCategories(names: string[]) {
  const map = new Map<string, string>();
  for (const name of names) {
    let category = await prisma.productCategory.findFirst({ where: { name, parentId: null } });
    if (!category) {
      category = await prisma.productCategory.create({ data: { name } });
    }
    map.set(name, category.id);
  }
  return map;
}

async function ensureUoms(shortCodes: Record<string, string>) {
  const map = new Map<string, string>();
  for (const [shortCode, name] of Object.entries(shortCodes)) {
    const uom = await prisma.unitOfMeasure.upsert({
      where: { shortCode },
      create: { name, shortCode },
      update: {},
    });
    map.set(shortCode, uom.id);
  }
  return map;
}

async function ensureSecondaryWarehouse() {
  let warehouse = await prisma.warehouse.findUnique({ where: { shortCode: "WH2" } });
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: { name: "North Distribution Center", shortCode: "WH2", address: "42 Logistics Park Rd" },
    });
    await prisma.location.create({
      data: { warehouseId: warehouse.id, name: "Stock", shortCode: "STOCK", kind: "INTERNAL" },
    });
    await prisma.location.create({
      data: { warehouseId: warehouse.id, name: "Overflow Rack", shortCode: "OVERFLOW", kind: "INTERNAL" },
    });
  }
  return warehouse;
}

async function postInitialStock(
  warehouse: { id: string; shortCode: string },
  locationId: string,
  adjustmentLocationId: string,
  productId: string,
  quantity: number,
) {
  await prisma.$transaction(async (tx) => {
    const reference = await nextReference(tx, warehouse.id, warehouse.shortCode, PickingType.ADJUSTMENT);
    const picking = await tx.picking.create({
      data: {
        reference,
        warehouseId: warehouse.id,
        pickingType: "ADJUSTMENT",
        partnerName: "Initial stock (bulk seed)",
        sourceLocationId: adjustmentLocationId,
        destLocationId: locationId,
        status: "DONE",
        scheduledDate: new Date(),
        doneDate: new Date(),
      },
    });
    await tx.stockMoveLine.create({
      data: {
        pickingId: picking.id,
        productId,
        quantity,
        sourceLocationId: adjustmentLocationId,
        destLocationId: locationId,
        status: "DONE",
        doneAt: new Date(),
      },
    });
    await tx.stockQuant.upsert({
      where: { productId_locationId: { productId, locationId } },
      create: { productId, locationId, quantity },
      update: { quantity: { increment: quantity } },
    });
  });
}

async function createReceipt(
  warehouse: { id: string; shortCode: string },
  vendorLocationId: string,
  stockLocationId: string,
  productId: string,
  quantity: number,
  partnerName: string,
  scheduledDate: Date,
  validate: boolean,
) {
  await prisma.$transaction(async (tx) => {
    const reference = await nextReference(tx, warehouse.id, warehouse.shortCode, PickingType.RECEIPT);
    const status = validate ? "DONE" : pick(["DRAFT", "READY"] as const);
    const picking = await tx.picking.create({
      data: {
        reference,
        warehouseId: warehouse.id,
        pickingType: "RECEIPT",
        partnerName,
        sourceLocationId: vendorLocationId,
        destLocationId: stockLocationId,
        status,
        scheduledDate,
        doneDate: validate ? new Date() : null,
      },
    });
    await tx.stockMoveLine.create({
      data: {
        pickingId: picking.id,
        productId,
        quantity,
        sourceLocationId: vendorLocationId,
        destLocationId: stockLocationId,
        status,
        doneAt: validate ? new Date() : null,
      },
    });
    if (validate) {
      await tx.stockQuant.upsert({
        where: { productId_locationId: { productId, locationId: stockLocationId } },
        create: { productId, locationId: stockLocationId, quantity },
        update: { quantity: { increment: quantity } },
      });
    }
  });
}

async function createDelivery(
  warehouse: { id: string; shortCode: string },
  stockLocationId: string,
  customerLocationId: string,
  productId: string,
  quantity: number,
  partnerName: string,
  scheduledDate: Date,
  validate: boolean,
) {
  await prisma.$transaction(async (tx) => {
    const reference = await nextReference(tx, warehouse.id, warehouse.shortCode, PickingType.DELIVERY);

    let status: "DRAFT" | "READY" | "WAITING" | "DONE" = validate ? "READY" : pick(["DRAFT", "READY"] as const);
    let actuallyValidated = false;

    if (validate) {
      const result = await tx.stockQuant.updateMany({
        where: { productId, locationId: stockLocationId, quantity: { gte: quantity } },
        data: { quantity: { decrement: quantity } },
      });
      if (result.count > 0) {
        status = "DONE";
        actuallyValidated = true;
      } else {
        status = "WAITING";
      }
    }

    const picking = await tx.picking.create({
      data: {
        reference,
        warehouseId: warehouse.id,
        pickingType: "DELIVERY",
        partnerName,
        sourceLocationId: stockLocationId,
        destLocationId: customerLocationId,
        status,
        scheduledDate,
        doneDate: actuallyValidated ? new Date() : null,
      },
    });
    await tx.stockMoveLine.create({
      data: {
        pickingId: picking.id,
        productId,
        quantity,
        sourceLocationId: stockLocationId,
        destLocationId: customerLocationId,
        status,
        doneAt: actuallyValidated ? new Date() : null,
      },
    });
  });
}

async function createInternalTransfer(
  warehouse: { id: string; shortCode: string },
  sourceLocationId: string,
  destLocationId: string,
  productId: string,
  quantity: number,
  scheduledDate: Date,
) {
  await prisma.$transaction(async (tx) => {
    const reference = await nextReference(tx, warehouse.id, warehouse.shortCode, PickingType.INTERNAL);
    const result = await tx.stockQuant.updateMany({
      where: { productId, locationId: sourceLocationId, quantity: { gte: quantity } },
      data: { quantity: { decrement: quantity } },
    });
    if (result.count === 0) return;

    await tx.picking.create({
      data: {
        reference,
        warehouseId: warehouse.id,
        pickingType: "INTERNAL",
        sourceLocationId,
        destLocationId,
        status: "DONE",
        scheduledDate,
        doneDate: new Date(),
        lines: {
          create: {
            productId,
            quantity,
            sourceLocationId,
            destLocationId,
            status: "DONE",
            doneAt: new Date(),
          },
        },
      },
    });
    await tx.stockQuant.upsert({
      where: { productId_locationId: { productId, locationId: destLocationId } },
      create: { productId, locationId: destLocationId, quantity },
      update: { quantity: { increment: quantity } },
    });
  });
}

async function main() {
  console.log("Ensuring base seed has run...");
  const baseWarehouse = await prisma.warehouse.findUnique({ where: { shortCode: "WH" } });
  const vendorLoc = await prisma.location.findFirst({ where: { kind: "VENDOR" } });
  const customerLoc = await prisma.location.findFirst({ where: { kind: "CUSTOMER" } });
  const adjustmentLoc = await prisma.location.findFirst({ where: { kind: "VIRTUAL_ADJUSTMENT" } });
  if (!baseWarehouse || !vendorLoc || !customerLoc || !adjustmentLoc) {
    throw new Error("Base seed data missing. Run `npm run prisma:seed` first.");
  }

  console.log("Ensuring extra categories and units of measure...");
  const categoryMap = await ensureCategories(Object.keys(CATALOG));
  const uomMap = await ensureUoms({
    PCS: "Units",
    KG: "Kilograms",
    BOX: "Boxes",
    L: "Litres",
    M: "Meters",
    PR: "Pairs",
  });

  console.log("Ensuring second warehouse...");
  const secondWarehouse = await ensureSecondaryWarehouse();
  const wh1Stock = await prisma.location.findFirstOrThrow({
    where: { warehouseId: baseWarehouse.id, shortCode: "STOCK" },
  });
  let wh1RackA = await prisma.location.findFirst({ where: { warehouseId: baseWarehouse.id, shortCode: "RACKA" } });
  if (!wh1RackA) {
    wh1RackA = await prisma.location.create({
      data: { warehouseId: baseWarehouse.id, name: "Rack A", shortCode: "RACKA", kind: "INTERNAL" },
    });
  }
  const wh2Stock = await prisma.location.findFirstOrThrow({
    where: { warehouseId: secondWarehouse.id, shortCode: "STOCK" },
  });

  console.log("Upserting product catalog (~130 SKUs)...");
  const catalog = buildCatalog();
  const products: { id: string; costPerUnit: number }[] = [];
  for (const item of catalog) {
    const product = await prisma.product.upsert({
      where: { sku: item.sku },
      create: {
        name: item.name,
        sku: item.sku,
        categoryId: categoryMap.get(item.category)!,
        uomId: uomMap.get(item.uom)!,
        costPerUnit: randomInt(...item.costRange),
        reorderMin: item.reorderMin,
        reorderMax: item.reorderMax,
      },
      update: {},
    });
    products.push({ id: product.id, costPerUnit: product.costPerUnit });
  }
  console.log(`Catalog ready: ${products.length} products.`);

  console.log("Posting initial stock for products with none yet...");
  let stockedCount = 0;
  for (const product of products) {
    const existingQuant = await prisma.stockQuant.findFirst({ where: { productId: product.id } });
    if (existingQuant) continue;
    const warehouse = Math.random() < 0.7 ? baseWarehouse : secondWarehouse;
    const locationId = warehouse.id === baseWarehouse.id ? wh1Stock.id : wh2Stock.id;
    await postInitialStock(warehouse, locationId, adjustmentLoc.id, product.id, randomInt(30, 400));
    stockedCount++;
  }
  console.log(`Initial stock posted for ${stockedCount} products.`);

  const operationalPickings = await prisma.picking.count({
    where: { pickingType: { in: ["RECEIPT", "DELIVERY", "INTERNAL"] } },
  });
  if (operationalPickings >= 60) {
    console.log(`Already have ${operationalPickings} receipt/delivery/transfer documents; skipping generation.`);
  } else {
    console.log("Generating ~65 receipts/deliveries/transfers/adjustments over the last 45 days...");

    for (let i = 0; i < 30; i++) {
      const product = pick(products);
      await createReceipt(
        baseWarehouse,
        vendorLoc.id,
        wh1Stock.id,
        product.id,
        randomInt(5, 80),
        pick(VENDORS),
        randomDate(45, 10),
        Math.random() < 0.75,
      );
    }

    for (let i = 0; i < 25; i++) {
      const product = pick(products);
      await createDelivery(
        baseWarehouse,
        wh1Stock.id,
        customerLoc.id,
        product.id,
        randomInt(1, 40),
        pick(CUSTOMERS),
        randomDate(40, 10),
        Math.random() < 0.7,
      );
    }

    for (let i = 0; i < 10; i++) {
      const product = pick(products);
      await createInternalTransfer(baseWarehouse, wh1Stock.id, wh1RackA.id, product.id, randomInt(1, 20), randomDate(30, 5));
    }

    console.log("Operational history generated.");
  }

  console.log("Bulk seed complete.");
  const [productCount, pickingCount, moveLineCount] = await Promise.all([
    prisma.product.count(),
    prisma.picking.count(),
    prisma.stockMoveLine.count(),
  ]);
  console.log(`Totals now: ${productCount} products, ${pickingCount} pickings, ${moveLineCount} stock move lines.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
