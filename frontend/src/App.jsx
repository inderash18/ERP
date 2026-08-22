import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ErpProvider } from "./context/ErpContext";
import PageTransition from "./components/layout/PageTransition";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RoleRoute from "./components/common/RoleRoute";
import AdminRoute from "./components/common/AdminRoute";

// Lazy-loaded route components for zero initial bundle bloat
const Login = lazy(() => import("./components/common/Login"));
const AdminLogin = lazy(() => import("./components/common/AdminLogin"));
const Signup = lazy(() => import("./components/common/Signup"));
const Layout = lazy(() => import("./components/layout/Layout"));
const Dashboard = lazy(() => import("./components/dashboard/Dashboard"));
const Inventory = lazy(() => import("./components/inventory/Inventory"));
const Sales = lazy(() => import("./components/sales/Sales"));
const Production = lazy(() => import("./components/manufacturing/Production"));
const Customers = lazy(() => import("./components/sales/Customers"));
const Settings = lazy(() => import("./components/common/Settings"));
const Employees = lazy(() => import("./components/common/Employees"));
const Products = lazy(() => import("./components/inventory/Products"));
const Suppliers = lazy(() => import("./components/purchase/Suppliers"));
const Purchase = lazy(() => import("./components/purchase/Purchase"));

// Ultra-lightweight route fallback indicator
function RouteFallback() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      width: "100%"
    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12
      }}>
        <div style={{
          width: 32,
          height: 32,
          border: "3px solid #1a73e8",
          borderRadius: "50%"
        }} />
        <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
          Loading workspace...
        </span>
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes location={location}>
        {/* Public Authentication Routes */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />
        <Route
          path="/admin-login"
          element={
            <PageTransition>
              <AdminLogin />
            </PageTransition>
          }
        />
        <Route
          path="/admin/login"
          element={<Navigate to="/admin-login" replace />}
        />
        <Route
          path="/signup"
          element={
            <PageTransition>
              <Signup />
            </PageTransition>
          }
        />

        {/* Protected ERP App Layout */}
        <Route
          path="/layout"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Role-Protected Routes */}
          <Route path="inventory" element={<RoleRoute permission="inventory.view"><Inventory /></RoleRoute>} />
          <Route path="products" element={<RoleRoute permission="inventory.view"><Products /></RoleRoute>} />
          
          <Route path="sales" element={<RoleRoute permission="sales.view"><Sales /></RoleRoute>} />
          <Route path="customers" element={<RoleRoute permission="customers.view"><Customers /></RoleRoute>} />
          
          <Route path="production" element={<RoleRoute permission="manufacturing.view"><Production /></RoleRoute>} />
          
          <Route path="purchase" element={<RoleRoute permission="purchase.view"><Purchase /></RoleRoute>} />
          <Route path="suppliers" element={<RoleRoute permission="suppliers.view"><Suppliers /></RoleRoute>} />
          
          {/* Admin-only Protected Route */}
          <Route
            path="users"
            element={
              <AdminRoute>
                <Employees />
              </AdminRoute>
            }
          />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Top-Level Route Aliases Protected by Redirect */}
        <Route path="/dashboard" element={<Navigate to="/layout/dashboard" replace />} />
        <Route path="/inventory" element={<Navigate to="/layout/inventory" replace />} />
        <Route path="/sales" element={<Navigate to="/layout/sales" replace />} />
        <Route path="/production" element={<Navigate to="/layout/production" replace />} />
        <Route path="/customers" element={<Navigate to="/layout/customers" replace />} />
        <Route path="/products" element={<Navigate to="/layout/products" replace />} />
        <Route path="/suppliers" element={<Navigate to="/layout/suppliers" replace />} />
        <Route path="/purchase" element={<Navigate to="/layout/purchase" replace />} />
        <Route path="/users" element={<Navigate to="/layout/users" replace />} />
        <Route path="/settings" element={<Navigate to="/layout/settings" replace />} />

        {/* Catch-all unknown routes → Redirect to Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ErpProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AnimatedRoutes />
      </BrowserRouter>
    </ErpProvider>
  );
}

export default App;