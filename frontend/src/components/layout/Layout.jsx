import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { 
  Package, Users, ShoppingCart, LogOut, LayoutDashboard, Settings, 
  Factory, Bell, AlertTriangle, CheckCircle2, X, Shield, 
  Box, Truck, FileText, ChevronRight, Search, Moon, Sun,
  Layers, ArrowUpRight, Check, Activity, Sliders, Warehouse
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useErp } from "../../context/ErpContext";
import RouteTransition from "./RouteTransition";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, authUser, metrics, dashboardMetrics, logoutUser, hasPermission } = useErp();
  
  // Interactive UI State
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [clearedAlerts, setClearedAlerts] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('mini_erp_theme') === 'dark';
    } catch {
      return false;
    }
  });

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('mini_erp_theme', next ? 'dark' : 'light');
      } catch {}
      return next;
    });
  };

  const handleLogout = async () => {
    setShowProfile(false);
    await logoutUser();
    navigate("/login");
  };

  const navSections = [
    {
      title: "OPERATIONS",
      items: [
        { name: "Executive Dashboard", path: "/layout",            icon: LayoutDashboard, count: null,                      perm: 'all' },
        { name: "Sales & POS",        path: "/layout/sales",      icon: ShoppingCart,    count: metrics?.pendingDeliveries > 0 ? `${metrics.pendingDeliveries}` : null, perm: 'sales.view' },
        { name: "Product Catalog",    path: "/layout/products",   icon: Box,             count: null,                      perm: 'inventory.view' },
        { name: "Inventory & Stock",  path: "/layout/inventory",  icon: Warehouse,       count: metrics?.lowStockCount > 0 ? `${metrics.lowStockCount}` : null, alert: metrics?.lowStockCount > 0, perm: 'inventory.view' },
      ]
    },
    {
      title: "SUPPLY CHAIN & PRODUCTION",
      items: [
        { name: "Procurement & POs",  path: "/layout/purchase",   icon: FileText,        count: metrics?.pendingReceipts > 0 ? `${metrics.pendingReceipts}` : null, perm: 'purchase.view' },
        { name: "Manufacturing & MOs", path: "/layout/production", icon: Factory,         count: metrics?.activeManufacturing > 0 ? `${metrics.activeManufacturing}` : null, perm: 'manufacturing.view' },
        { name: "Vendor Directory",   path: "/layout/suppliers",  icon: Truck,           count: null,                      perm: 'suppliers.view' },
        { name: "Customer CRM",       path: "/layout/customers",  icon: Users,           count: null,                      perm: 'customers.view' },
      ]
    },
    {
      title: "ADMINISTRATION",
      items: [
        { name: "Access & RBAC",      path: "/layout/users",      icon: Shield,          count: null,                      perm: 'admin' },
        { name: "System Settings",    path: "/layout/settings",   icon: Settings,        count: null,                      perm: 'all' },
      ]
    }
  ];

  const currentRole = (authUser?.role || user?.role || 'User').toUpperCase();
  const isAdmin = currentRole === 'ADMIN' || currentRole === 'SYSTEM ADMINISTRATOR' || currentRole === 'BUSINESS OWNER' || (authUser?.permissions || []).includes('*');

  const isActive = (path) => {
    if (path === "/layout")
      return location.pathname === "/layout" || location.pathname === "/layout/";
    return location.pathname.startsWith(path);
  };

  const rawAlerts = metrics?.alerts || dashboardMetrics?.lowStockAlerts || [];
  const alertsList = clearedAlerts ? [] : rawAlerts;

  const getUserFirstName = () => {
    const fullName = user?.name || user?.firstName || authUser?.name || 'Admin';
    return fullName.split(' ')[0];
  };

  const userEmail = authUser?.email || user?.email || 'admin@shivfurniture.in';
  const employeeId = authUser?.employeeId || user?.employeeId || 'ADMIN01';

  // Get Current Page Breadcrumb Title
  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path === "/layout" || path === "/layout/") return "Executive Dashboard";
    if (path.includes("/sales")) return "Sales & Commercial";
    if (path.includes("/products")) return "Product Master";
    if (path.includes("/inventory")) return "Stock & Inventory Control";
    if (path.includes("/purchase")) return "Procurement & Purchase Orders";
    if (path.includes("/production")) return "Shop Floor & Manufacturing";
    if (path.includes("/suppliers")) return "Vendor Management";
    if (path.includes("/customers")) return "Customer CRM";
    if (path.includes("/users")) return "Roles & Team Permissions";
    if (path.includes("/settings")) return "System Configuration";
    return "Operations";
  };

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      overflow: "hidden",
      background: darkMode ? "#0b0d11" : "#f8fafc",
      color: darkMode ? "#f1f5f9" : "#0f172a",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>

      {/* ── Human-Crafted Minimalist Sidebar ──────────────────────── */}
      <aside style={{
        width: 250, flexShrink: 0,
        display: "flex", flexDirection: "column",
        background: darkMode ? "#11141a" : "#ffffff",
        borderRight: darkMode ? "1px solid #1e2430" : "1px solid #e2e8f0",
        padding: "16px 12px 14px",
        position: "relative",
        zIndex: 20
      }}>

        {/* Workspace Organization Switcher */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 10px",
          borderRadius: "8px",
          background: darkMode ? "#171b22" : "#f1f5f9",
          marginBottom: 16
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: "#2563eb",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#ffffff", fontSize: 13, fontWeight: 800
            }}>
              SF
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: darkMode ? "#f8fafc" : "#0f172a", lineHeight: 1.1 }}>
                Shiv Furniture
              </div>
              <div style={{ fontSize: 10.5, color: "#64748b", fontWeight: 500 }}>
                Enterprise SaaS
              </div>
            </div>
          </div>
          <span style={{
            fontSize: 9.5, fontWeight: 700,
            background: darkMode ? "#1e293b" : "#e2e8f0",
            color: "#64748b",
            padding: "2px 5px",
            borderRadius: 4
          }}>
            v2.4
          </span>
        </div>

        {/* Navigation Sections */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>
          {navSections.map((section, sIdx) => {
            const visibleItems = section.items.filter(item => {
              if (item.perm === 'all') return true;
              if (item.perm === 'admin') return isAdmin;
              return hasPermission(item.perm);
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title || sIdx}>
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#94a3b8",
                  letterSpacing: "0.06em",
                  padding: "0 10px 6px",
                  textTransform: "uppercase"
                }}>
                  {section.title}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {visibleItems.map(item => {
                    const active = isActive(item.path);

                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          textDecoration: "none",
                          color: active ? (darkMode ? "#60a5fa" : "#2563eb") : (darkMode ? "#94a3b8" : "#475569"),
                          background: active ? (darkMode ? "#172554" : "#eff6ff") : "transparent",
                          fontWeight: active ? 600 : 500,
                          fontSize: 13,
                          transition: "all 0.1s ease"
                        }}
                        onMouseEnter={e => {
                          if (!active) e.currentTarget.style.background = darkMode ? "#171b22" : "#f8fafc";
                        }}
                        onMouseLeave={e => {
                          if (!active) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <item.icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                          <span>{item.name}</span>
                        </div>

                        {item.count && (
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "1px 6px",
                            borderRadius: "4px",
                            background: item.alert ? "#fef3c7" : (darkMode ? "#1e293b" : "#e2e8f0"),
                            color: item.alert ? "#b45309" : "#475569"
                          }}>
                            {item.count}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Footer Profile Card */}
        <div style={{
          marginTop: "auto",
          borderTop: darkMode ? "1px solid #1e2430" : "1px solid #e2e8f0",
          paddingTop: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div
            onClick={() => setShowProfile(true)}
            style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "4px 6px", borderRadius: 6, cursor: "pointer",
              flex: 1, minWidth: 0
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "#2563eb", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, flexShrink: 0
            }}>
              {getUserFirstName()[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: darkMode ? "#f1f5f9" : "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name || getUserFirstName()}
              </div>
              <div style={{ fontSize: 10.5, color: "#64748b" }}>
                {employeeId} • {currentRole}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            style={{
              background: "transparent", border: "none", color: "#64748b",
              cursor: "pointer", padding: "6px", borderRadius: 6
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#64748b"; }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* ── Main Workspace Area ─────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden" }}>
        
        {/* Crisp Enterprise Header Bar */}
        <header style={{
          height: 52,
          background: darkMode ? "#11141a" : "#ffffff",
          borderBottom: darkMode ? "1px solid #1e2430" : "1px solid #e2e8f0",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0
        }}>
          {/* Breadcrumbs Navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b" }}>
            <span style={{ fontWeight: 500 }}>Shiv Furniture</span>
            <ChevronRight size={14} />
            <span style={{ fontWeight: 600, color: darkMode ? "#f8fafc" : "#0f172a" }}>
              {getBreadcrumbTitle()}
            </span>
          </div>

          {/* Right Action Tools */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
            
            {/* Live Database Sync Dot */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 11.5, fontWeight: 500, color: "#16a34a",
              background: darkMode ? "#052e16" : "#f0fdf4",
              border: darkMode ? "1px solid #14532d" : "1px solid #bbf7d0",
              padding: "3px 8px", borderRadius: 6
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
              Live Sync
            </div>

            {/* Dark Mode Switch */}
            <button
              onClick={toggleDarkMode}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              style={{
                width: 32, height: 32, borderRadius: 6, border: darkMode ? "1px solid #1e2430" : "1px solid #e2e8f0",
                background: darkMode ? "#171b22" : "#f8fafc", color: darkMode ? "#fbbf24" : "#64748b",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
              }}
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              title="Notifications"
              style={{
                position: "relative",
                width: 32, height: 32, borderRadius: 6,
                border: darkMode ? "1px solid #1e2430" : "1px solid #e2e8f0",
                background: showNotifications ? (darkMode ? "#172554" : "#eff6ff") : (darkMode ? "#171b22" : "#f8fafc"),
                color: "#64748b",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
              }}
            >
              <Bell size={15} />
              {alertsList.length > 0 && (
                <span style={{
                  position: "absolute", top: -2, right: -2,
                  width: 8, height: 8, borderRadius: "50%", background: "#ef4444"
                }} />
              )}
            </button>

            {/* User Avatar Circle */}
            <div
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "#2563eb", color: "#fff",
                fontSize: 12, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer"
              }}
            >
              {getUserFirstName()[0]}
            </div>

            {/* Profile Dropdown Modal */}
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  style={{
                    position: "absolute", top: 42, right: 0, width: 280,
                    background: darkMode ? "#11141a" : "#ffffff",
                    borderRadius: 10, border: darkMode ? "1px solid #1e2430" : "1px solid #e2e8f0",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
                    padding: "16px", zIndex: 60
                  }}
                >
                  <div style={{ paddingBottom: 12, borderBottom: darkMode ? "1px solid #1e2430" : "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: darkMode ? "#f8fafc" : "#0f172a" }}>
                      {user?.name || getUserFirstName()}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 1 }}>
                      {userEmail}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "#eff6ff", color: "#2563eb" }}>
                        {currentRole}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: darkMode ? "#1e293b" : "#f1f5f9", color: "#64748b" }}>
                        {employeeId}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: "8px 0", display: "flex", flexDirection: "column", gap: 2 }}>
                    <Link
                      to="/layout/settings"
                      onClick={() => setShowProfile(false)}
                      style={{
                        padding: "8px 10px", borderRadius: 6, textDecoration: "none",
                        color: darkMode ? "#cbd5e1" : "#334155", fontSize: 12.5, fontWeight: 500,
                        display: "flex", alignItems: "center", gap: 8
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = darkMode ? "#171b22" : "#f8fafc"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <Settings size={14} color="#64748b" />
                      <span>Account Settings</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/layout/users"
                        onClick={() => setShowProfile(false)}
                        style={{
                          padding: "8px 10px", borderRadius: 6, textDecoration: "none",
                          color: darkMode ? "#cbd5e1" : "#334155", fontSize: 12.5, fontWeight: 500,
                          display: "flex", alignItems: "center", gap: 8
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = darkMode ? "#171b22" : "#f8fafc"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <Shield size={14} color="#64748b" />
                        <span>Team & Access Control</span>
                      </Link>
                    )}
                  </div>

                  <div style={{ borderTop: darkMode ? "1px solid #1e2430" : "1px solid #f1f5f9", paddingTop: 8 }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: "100%", padding: "8px 10px", borderRadius: 6, border: "none",
                        background: "#fef2f2", color: "#dc2626", fontSize: 12.5, fontWeight: 600,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer"
                      }}
                    >
                      <LogOut size={13} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  style={{
                    position: "absolute", top: 42, right: 36, width: 320,
                    background: darkMode ? "#11141a" : "#ffffff",
                    borderRadius: 10, border: darkMode ? "1px solid #1e2430" : "1px solid #e2e8f0",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
                    padding: "14px", zIndex: 60
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingBottom: 6, borderBottom: darkMode ? "1px solid #1e2430" : "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: darkMode ? "#f8fafc" : "#0f172a" }}>
                      System Alerts ({alertsList.length})
                    </span>
                    <button onClick={() => setShowNotifications(false)} style={{ border: "none", background: "transparent", color: "#64748b", cursor: "pointer" }}>
                      <X size={14} />
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 240, overflowY: "auto" }}>
                    {alertsList.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "20px 0", color: "#64748b", fontSize: 12 }}>
                        No active alerts. All operations nominal.
                      </div>
                    ) : (
                      alertsList.map((alt, aIdx) => (
                        <div key={alt.id || aIdx} style={{ padding: "8px 10px", borderRadius: 6, background: darkMode ? "#1e293b" : "#fef3c7", border: darkMode ? "1px solid #334155" : "1px solid #fde68a", display: "flex", gap: 8 }}>
                          <AlertTriangle size={14} color="#b45309" style={{ marginTop: 2, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 11.5, fontWeight: 700, color: darkMode ? "#f1f5f9" : "#0f172a" }}>{alt.title || alt.productName || 'Low Stock Alert'}</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>{alt.message || `${alt.productName || 'Product'}: ${alt.onHand ?? 0} remaining`}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </header>

        {/* Page Content View */}
        <main style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px",
          background: darkMode ? "#0b0d11" : "#f8fafc"
        }}>
          <div style={{ maxWidth: 1440, margin: "0 auto" }}>
            <RouteTransition>
              <Outlet />
            </RouteTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
