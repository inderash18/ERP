import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import AdminLogin from "./components/AdminLogin";
import Signup from "./components/Signup";
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default → Login */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Login Page */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Admin Login Page */}
        <Route
          path="/admin-login"
          element={<AdminLogin />}
        />

        {/* Signup Page */}
        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* Main Layout */}
        <Route
          path="/layout"
          element={<Layout />}
        />

        {/* Any unknown URL → Login */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;