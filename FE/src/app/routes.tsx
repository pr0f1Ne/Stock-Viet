import { createBrowserRouter, Navigate } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import { DashboardHome } from "./pages/DashboardHome";
import { InventoryPage } from "./pages/InventoryPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { OrdersPage } from "./pages/OrdersPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { LoginPage } from "./pages/LoginPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: DashboardHome },
      { path: "inventory", Component: InventoryPage },
      { path: "analytics", Component: AnalyticsPage },
      { path: "orders", Component: OrdersPage },
      { path: "reports", Component: ReportsPage },
      { path: "profile", Component: ProfilePage },
      { path: "settings", element: <Navigate to="/" replace /> },
      { path: "suppliers", element: <Navigate to="/" replace /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
