import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ErpProvider } from "./context/ErpContext";
import Login from "./components/common/Login";
import AdminLogin from "./components/common/AdminLogin";
import Signup from "./components/common/Signup";
import Layout from "./components/layout/Layout";
import Dashboard from "./components/dashboard/Dashboard";
import Inventory from "./components/inventory/Inventory";
import Sales from "./components/sales/Sales";
import Production from "./components/manufacturing/Production";
import Customers from "./components/sales/Customers";
import Settings from "./components/common/Settings";
import Employees from "./components/common/Employees";
import Products from "./components/inventory/Products";
import Suppliers from "./components/purchase/Suppliers";
import Purchase from "./components/purchase/Purchase";
import PageTransition from "./components/layout/PageTransition";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RoleRoute from "./components/common/RoleRoute";
import AdminRoute from "./components/common/AdminRoute";

function AnimatedRoutes() {
  const location = useLocation();

  return (
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
  );
}

function App() {
  return (
    <ErpProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </ErpProvider>
  );
}

export default App;