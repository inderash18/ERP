import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

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
import PageTransition from "./components/layout/PageTransition";

function AnimatedRoutes() {
  const location = useLocation();
  const baseKey = location.pathname.startsWith("/layout") ? "/layout" : location.pathname;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={baseKey}>
        {/* Default → Login */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Login Page */}
        <Route
          path="/login"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />

        {/* Admin Login Page */}
        <Route
          path="/admin-login"
          element={
            <PageTransition>
              <AdminLogin />
            </PageTransition>
          }
        />

        {/* Signup Page */}
        <Route
          path="/signup"
          element={
            <PageTransition>
              <Signup />
            </PageTransition>
          }
        />

        {/* Main Layout with nested routes */}
        <Route
          path="/layout"
          element={
            <PageTransition>
              <Layout />
            </PageTransition>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="sales" element={<Sales />} />
          <Route path="production" element={<Production />} />
          <Route path="customers" element={<Customers />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Any unknown URL → Login */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </AnimatePresence>
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