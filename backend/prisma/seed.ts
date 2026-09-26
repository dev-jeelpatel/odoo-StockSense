import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding virtual locations (vendor/customer/adjustment)...");
  const virtualLocations: Array<{ name: string; shortCode: string; kind: "VENDOR" | "CUSTOMER" | "VIRTUAL_ADJUSTMENT" }> = [
    { name: "Vendors", shortCode: "VENDOR", kind: "VENDOR" },
    { name: "Customers", shortCode: "CUSTOMER", kind: "CUSTOMER" },
    { name: "Inventory Adjustment", shortCode: "ADJUST", kind: "VIRTUAL_ADJUSTMENT" },
  ];
  for (const loc of virtualLocations) {
    const existing = await prisma.location.findFirst({ where: { kind: loc.kind } });
    if (!existing) {
      await prisma.location.create({ data: { ...loc, warehouseId: null } });
    }
  }

  console.log("Seeding units of measure...");
  const uoms = [
    { name: "Units", shortCode: "PCS" },
    { name: "Kilograms", shortCode: "KG" },
    { name: "Boxes", shortCode: "BOX" },
    { name: "Litres", shortCode: "L" },
  ];
  for (const uom of uoms) {
    await prisma.unitOfMeasure.upsert({
      where: { shortCode: uom.shortCode },
      create: uom,
      update: {},
    });
  }
  const pcs = await prisma.unitOfMeasure.findUniqueOrThrow({ where: { shortCode: "PCS" } });
  const kg = await prisma.unitOfMeasure.findUniqueOrThrow({ where: { shortCode: "KG" } });

  console.log("Seeding product categories...");
  const rawMaterials = await prisma.productCategory.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    create: { id: "00000000-0000-0000-0000-000000000001", name: "Raw Materials" },
    update: {},
  });
  const finishedGoods = await prisma.productCategory.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    create: { id: "00000000-0000-0000-0000-000000000002", name: "Finished Goods" },
    update: {},
  });

  console.log("Seeding demo users...");
  const managerPasswordHash = await bcrypt.hash("Manager@123", 10);
  const staffPasswordHash = await bcrypt.hash("Staff@123", 10);

  await prisma.user.upsert({
    where: { email: "manager@stocksense.local" },
    create: {
      name: "Inventory Manager",
      email: "manager@stocksense.local",
      passwordHash: managerPasswordHash,
      role: "MANAGER",
    },
    update: {},
  });

  await prisma.user.upsert({
    where: { email: "staff@stocksense.local" },
    create: {
      name: "Warehouse Staff",
      email: "staff@stocksense.local",
      passwordHash: staffPasswordHash,
      role: "STAFF",
    },
    update: {},
  });

  console.log("Seeding a demo warehouse with sample products...");
  let warehouse = await prisma.warehouse.findUnique({ where: { shortCode: "WH" } });
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: { name: "Main Warehouse", shortCode: "WH", address: "1 Industrial Ave" },
    });
    await prisma.location.create({
      data: { warehouseId: warehouse.id, name: "Stock", shortCode: "STOCK", kind: "INTERNAL" },
    });
  }
  const stockLocation = await prisma.location.findFirstOrThrow({
    where: { warehouseId: warehouse.id, shortCode: "STOCK" },
  });

  const steelRods = await prisma.product.upsert({
    where: { sku: "SKU-STEEL-ROD" },
    create: {
      name: "Steel Rods",
      sku: "SKU-STEEL-ROD",
      categoryId: rawMaterials.id,
      uomId: kg.id,
      reorderMin: 20,
      reorderMax: 200,
    },
    update: {},
  });

  const chairs = await prisma.product.upsert({
    where: { sku: "SKU-CHAIR-001" },
    create: {
      name: "Office Chair",
      sku: "SKU-CHAIR-001",
      categoryId: finishedGoods.id,
      uomId: pcs.id,
      reorderMin: 5,
      reorderMax: 50,
    },
    update: {},
  });

  for (const product of [steelRods, chairs]) {
    await prisma.stockQuant.upsert({
      where: { productId_locationId: { productId: product.id, locationId: stockLocation.id } },
      create: { productId: product.id, locationId: stockLocation.id, quantity: 100 },
      update: {},
    });
  }

  console.log("Seed complete.");
  console.log("Demo logins: manager@stocksense.local / Manager@123, staff@stocksense.local / Staff@123");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
