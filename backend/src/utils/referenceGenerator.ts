import { Prisma, PickingType } from "@prisma/client";

const OPERATION_CODES: Record<PickingType, string> = {
  RECEIPT: "IN",
  DELIVERY: "OUT",
  INTERNAL: "INT",
  ADJUSTMENT: "ADJ",
};

/**
 * Atomically assigns the next reference number for a warehouse+picking type
 * (e.g. WH/IN/0001) using a row lock, so concurrent creations never collide.
 * Must be called inside an existing Prisma transaction.
 */
export async function nextReference(
  tx: Prisma.TransactionClient,
  warehouseId: string,
  warehouseShortCode: string,
  pickingType: PickingType,
): Promise<string> {
  await tx.referenceSequence.upsert({
    where: { warehouseId_pickingType: { warehouseId, pickingType } },
    create: { warehouseId, pickingType, nextNumber: 1 },
    update: {},
  });

  const rows = await tx.$queryRaw<{ id: string; next_number: number }[]>`
    SELECT id, next_number FROM reference_sequences
    WHERE warehouse_id = ${warehouseId} AND picking_type = ${pickingType}::"PickingType"
    FOR UPDATE
  `;
  const row = rows[0];
  const assigned = row.next_number;

  await tx.referenceSequence.update({
    where: { id: row.id },
    data: { nextNumber: assigned + 1 },
  });

  const opCode = OPERATION_CODES[pickingType];
  const padded = String(assigned).padStart(4, "0");
  return `${warehouseShortCode}/${opCode}/${padded}`;
}
