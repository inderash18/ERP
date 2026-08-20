import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Login from "./components/Login";
import AdminLogin from "./components/AdminLogin";
import Signup from "./components/Signup";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Production from "./pages/Production";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";
import PageTransition from "./components/PageTransition";


function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

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
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;