export type UserRole = "MANAGER" | "STAFF";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export type LocationKind = "INTERNAL" | "VENDOR" | "CUSTOMER" | "VIRTUAL_ADJUSTMENT";

export interface Warehouse {
  id: string;
  name: string;
  shortCode: string;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { locations: number; pickings: number };
}

export interface Location {
  id: string;
  warehouseId: string | null;
  name: string;
  shortCode: string;
  kind: LocationKind;
  parentLocationId: string | null;
  createdAt: string;
  warehouse?: { id: string; name: string; shortCode: string } | null;
}

export interface ProductCategory {
  id: string;
  name: string;
  parentId: string | null;
  parent?: { id: string; name: string } | null;
  _count?: { products: number; children: number };
}

export interface UnitOfMeasure {
  id: string;
  name: string;
  shortCode: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  uomId: string;
  reorderMin: number;
  reorderMax: number;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string };
  uom: { id: string; name: string; shortCode: string };
  quants?: { quantity: number }[];
}

export type PickingType = "RECEIPT" | "DELIVERY" | "INTERNAL" | "ADJUSTMENT";
export type PickingStatus = "DRAFT" | "WAITING" | "READY" | "DONE" | "CANCELLED";

export interface StockMoveLine {
  id: string;
  pickingId: string;
  productId: string;
  quantity: number;
  sourceLocationId: string;
  destLocationId: string;
  status: PickingStatus;
  createdAt: string;
  doneAt: string | null;
  product: { id: string; name: string; sku: string; uom: { shortCode: string } };
  sourceLocation: { id: string; name: string };
  destLocation: { id: string; name: string };
}

export interface Picking {
  id: string;
  reference: string;
  warehouseId: string;
  pickingType: PickingType;
  partnerName: string | null;
  sourceLocationId: string;
  destLocationId: string;
  status: PickingStatus;
  scheduledDate: string;
  doneDate: string | null;
  responsibleUserId: string | null;
  createdAt: string;
  updatedAt: string;
  isLate: boolean;
  warehouse: { id: string; name: string; shortCode: string };
  sourceLocation: { id: string; name: string; kind: LocationKind };
  destLocation: { id: string; name: string; kind: LocationKind };
  responsibleUser: { id: string; name: string } | null;
  lines: StockMoveLine[];
}

export interface StockQuant {
  id: string;
  productId: string;
  locationId: string;
  quantity: number;
  product: { id: string; name: string; sku: string; uom: { shortCode: string } };
  location: { id: string; name: string; warehouse: { id: string; name: string; shortCode: string } };
}

export interface MoveLedgerEntry extends StockMoveLine {
  direction: "IN" | "OUT" | "INTERNAL";
  picking: {
    id: string;
    reference: string;
    pickingType: PickingType;
    partnerName: string | null;
    warehouse: { id: string; name: string; shortCode: string };
  };
}

export interface ReorderAlert {
  id: string;
  name: string;
  sku: string;
  uom: string;
  onHand: number;
  reorderMin: number;
  reorderMax: number;
  status: "OUT_OF_STOCK" | "LOW_STOCK";
}

export interface DashboardKpis {
  totalProductsInStock: number;
  lowStockItems: number;
  outOfStockItems: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  internalTransfersScheduled: number;
}

export interface ApiErrorBody {
  error: {
    message: string;
    fields?: Record<string, string>;
  };
}
