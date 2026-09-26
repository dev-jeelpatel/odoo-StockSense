import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/pages/auth/LoginPage";
import { SignupPage } from "@/pages/auth/SignupPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { ProductsPage } from "@/pages/products/ProductsPage";
import { ReceiptsPage } from "@/pages/operations/ReceiptsPage";
import { DeliveriesPage } from "@/pages/operations/DeliveriesPage";
import { InternalTransfersPage } from "@/pages/operations/InternalTransfersPage";
import { AdjustmentsPage } from "@/pages/operations/AdjustmentsPage";
import { MoveHistoryPage } from "@/pages/move-history/MoveHistoryPage";
import { StockPage } from "@/pages/stock/StockPage";
import { WarehousesPage } from "@/pages/settings/WarehousesPage";
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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/operations/receipts" element={<ReceiptsPage />} />
          <Route path="/operations/deliveries" element={<DeliveriesPage />} />
          <Route path="/operations/internal-transfers" element={<InternalTransfersPage />} />
          <Route path="/operations/adjustments" element={<AdjustmentsPage />} />
          <Route path="/move-history" element={<MoveHistoryPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/settings/warehouses" element={<WarehousesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
