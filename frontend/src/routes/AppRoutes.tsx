import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/pages/auth/LoginPage";
import { SignupPage } from "@/pages/auth/SignupPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { ProductsPage } from "@/pages/products/ProductsPage";
import { ImportExportPage } from "@/pages/products/ImportExportPage";
import { BarcodeScannerPage } from "@/pages/products/BarcodeScannerPage";
import { ReceiptsPage } from "@/pages/operations/ReceiptsPage";
import { DeliveriesPage } from "@/pages/operations/DeliveriesPage";
import { InternalTransfersPage } from "@/pages/operations/InternalTransfersPage";
import { AdjustmentsPage } from "@/pages/operations/AdjustmentsPage";
import { PickingDetailPage } from "@/pages/operations/PickingDetailPage";
import { CalendarPage } from "@/pages/operations/CalendarPage";
import { MoveHistoryPage } from "@/pages/move-history/MoveHistoryPage";
import { StockPage } from "@/pages/stock/StockPage";
import { WarehousesPage } from "@/pages/settings/WarehousesPage";
import { LocationsPage } from "@/pages/settings/LocationsPage";
import { CategoriesPage } from "@/pages/settings/CategoriesPage";
import { UsersPage } from "@/pages/settings/UsersPage";
import { ProfilePage } from "@/pages/profile/ProfilePage";
import { ProtectedRoute, PublicOnlyRoute } from "./ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Products */}
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/import-export" element={<ImportExportPage />} />
          <Route path="/products/scanner" element={<BarcodeScannerPage />} />

          {/* Operations */}
          <Route path="/operations/receipts" element={<ReceiptsPage />} />
          <Route path="/operations/receipts/:id" element={<PickingDetailPage />} />
          <Route path="/operations/deliveries" element={<DeliveriesPage />} />
          <Route path="/operations/deliveries/:id" element={<PickingDetailPage />} />
          <Route path="/operations/internal-transfers" element={<InternalTransfersPage />} />
          <Route path="/operations/internal-transfers/:id" element={<PickingDetailPage />} />
          <Route path="/operations/adjustments" element={<AdjustmentsPage />} />
          <Route path="/operations/adjustments/:id" element={<PickingDetailPage />} />
          <Route path="/operations/calendar" element={<CalendarPage />} />

          {/* Reports */}
          <Route path="/move-history" element={<MoveHistoryPage />} />
          <Route path="/stock" element={<StockPage />} />

          {/* Settings */}
          <Route path="/settings/warehouses" element={<WarehousesPage />} />
          <Route path="/settings/locations" element={<LocationsPage />} />
          <Route path="/settings/categories" element={<CategoriesPage />} />
          <Route path="/settings/users" element={<UsersPage />} />

          {/* Profile */}
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
