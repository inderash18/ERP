import { useState } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { 
  Package, Users, ShoppingCart, LogOut, LayoutDashboard, Settings, 
  Factory, Bell, AlertTriangle, CheckCircle2, RotateCcw, X, Shield, 
  Box, Truck, FileText, ChevronRight, Search, Moon, HelpCircle,
  Plus, Sparkles, Command, SlidersHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useErp } from "../../context/ErpContext";
import RouteTransition from "./RouteTransition";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, authUser, metrics, dashboardMetrics, logoutUser, hasPermission } = useErp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const rawNavItems = [
    { name: "Dashboard",       path: "/layout",            icon: LayoutDashboard, count: null,                      perm: 'all' },
    { name: "Sales & POS",     path: "/layout/sales",      icon: ShoppingCart,    count: metrics?.pendingDeliveries > 0 ? `${metrics.pendingDeliveries}` : null, perm: 'sales.view' },
    { name: "Products",        path: "/layout/products",   icon: Box,             count: null,                      perm: 'inventory.view' },
    { name: "Inventory",       path: "/layout/inventory",  icon: Package,         count: metrics?.lowStockCount > 0 ? `${metrics.lowStockCount} low` : null, alert: metrics?.lowStockCount > 0, perm: 'inventory.view' },
    { name: "Purchases",       path: "/layout/purchase",   icon: FileText,        count: metrics?.pendingReceipts > 0 ? `${metrics.pendingReceipts}` : null, perm: 'purchase.view' },
    { name: "Manufacturing",   path: "/layout/production", icon: Factory,         count: metrics?.activeManufacturing > 0 ? `${metrics.activeManufacturing}` : null, perm: 'manufacturing.view' },
    { name: "Suppliers",       path: "/layout/suppliers",  icon: Truck,           count: null,                      perm: 'suppliers.view' },
    { name: "Customers & CRM", path: "/layout/customers",  icon: Users,           count: null,                      perm: 'customers.view' },
    { name: "Users & RBAC",    path: "/layout/users",      icon: Shield,          count: null,                      perm: 'admin' },
    { name: "Settings",        path: "/layout/settings",   icon: Settings,        count: null,                      perm: 'all' },
  ];

  const currentRole = (authUser?.role || user?.role || 'User').toUpperCase();
  const isAdmin = currentRole === 'ADMIN' || currentRole === 'SYSTEM ADMINISTRATOR' || currentRole === 'BUSINESS OWNER' || (authUser?.permissions || []).includes('*');

  const navItems = rawNavItems.filter(item => {
    if (item.perm === 'all') return true;
    if (item.perm === 'admin') return isAdmin;
    return hasPermission(item.perm);
  });

  const isActive = (path) => {
    if (path === "/layout")
      return location.pathname === "/layout" || location.pathname === "/layout/";
    return location.pathname.startsWith(path);
  };

  const alertsList = metrics?.alerts || dashboardMetrics?.lowStockAlerts || [];

  const getUserFirstName = () => {
    const fullName = user?.name || user?.firstName || authUser?.name || 'Admin';
    return fullName.split(' ')[0];
  };

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      overflow: "hidden",
      background: "#f8fafd",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    }}>

      {/* ── macOS Frosted Acrylic Sidebar ──────────────────────── */}
      <aside style={{
        width: 255, flexShrink: 0,
        display: "flex", flexDirection: "column",
        background: "rgba(242, 246, 252, 0.85)",
        backdropFilter: "blur(30px) saturate(190%)",
        borderRight: "1px solid rgba(0, 0, 0, 0.08)",
        padding: "16px 14px 14px",
        position: "relative",
        zIndex: 20
      }}>

        {/* macOS Window Controls (Traffic Lights) */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "2px 8px 16px" }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56", border: "1px solid #e0443e", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.4)" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e", border: "1px solid #dea123", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.4)" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f", border: "1px solid #1aab29", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.4)" }} />
        </div>

        {/* Google Workspace Brand Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px 16px" }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg, #4285f4 0%, #1a73e8 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#ffffff",
            boxShadow: "0 2px 8px rgba(26, 115, 232, 0.3)"
          }}>
            <span style={{ fontSize: 13, fontWeight: 900 }}>SF</span>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1f1f1f", letterSpacing: "-0.2px", lineHeight: 1.2 }}>
              Shiv Furniture
            </div>
            <div style={{ fontSize: 11, color: "#5f6368", fontWeight: 500 }}>
              Enterprise ERP
            </div>
          </div>
        </div>

        {/* Google Material 3 Navigation Items */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, overflowY: "auto" }}>
          {navItems.map((item) => {
            const active = isActive(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "9px 14px",
                  borderRadius: "9999px",
                  textDecoration: "none",
                  color: active ? "#0b57d0" : "#444746",
                  background: active ? "#d3e3fd" : "transparent",
                  fontWeight: active ? 600 : 500,
                  fontSize: 13.5,
                  transition: "all 0.15s ease",
                  position: "relative"
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.background = "#e9eef6";
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Icon */}
                <motion.span
                  key={`${item.path}-${active}`}
                  initial={active ? { scale: 0.85 } : { scale: 1 }}
                  animate={{ scale: 1 }}
                  style={{ display: "flex", flexShrink: 0, color: active ? "#0b57d0" : "#444746" }}
                >
                  <item.icon size={18} strokeWidth={active ? 2.3 : 1.8} />
                </motion.span>

                {/* Text */}
                <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.name}
                </span>

                {/* Badge */}
                {item.count && (
                  <span style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    background: item.alert ? "#fef3c7" : "#e0e3e7",
                    color: item.alert ? "#b45309" : "#444746"
                  }}>
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div style={{ marginTop: "auto", borderTop: "1px solid rgba(0, 0, 0, 0.08)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "#1a73e8", color: "#ffffff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700
            }}>
              {getUserFirstName()[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1f1f1f", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name || getUserFirstName()}
              </div>
              <div style={{ fontSize: 11, color: "#5f6368" }}>
                {currentRole}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 12px", borderRadius: "9999px", border: "none",
              background: "transparent", color: "#d93025",
              fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#fce8e6"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Workspace ─────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden" }}>
        
        {/* Google / macOS Top App Bar */}
        <header style={{
          height: 64,
          background: "#ffffff",
          borderBottom: "1px solid #e1e3e1",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          boxShadow: "0 1px 3px rgba(60,64,67,0.08)"
        }}>
          {/* Google-Style Global Search Capsule */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "#edf2fa",
            borderRadius: "9999px",
            padding: "8px 18px",
            width: 440,
            transition: "all 0.2s ease"
          }}>
            <Search size={17} color="#5f6368" />
            <input
              type="text"
              placeholder="Search orders, products, inventory, customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: 13,
                color: "#1f1f1f",
                width: "100%"
              }}
            />
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              background: "#ffffff",
              color: "#5f6368",
              padding: "2px 6px",
              borderRadius: 6,
              border: "1px solid #dadce0"
            }}>
              ⌘K
            </span>
          </div>

          {/* Right Action Icons & Status */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
            {/* Live Database Sync Badge */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: "#137333",
              background: "#e6f4ea",
              padding: "4px 12px",
              borderRadius: "9999px",
              border: "1px solid #ceead6"
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34a853" }} />
              MongoDB Connected
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                position: "relative",
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: "none",
                background: showNotifications ? "#e8f0fe" : "transparent",
                color: "#444746",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f1f3f4"; }}
              onMouseLeave={e => { if (!showNotifications) e.currentTarget.style.background = "transparent"; }}
            >
              <Bell size={18} />
              {alertsList.length > 0 && (
                <span style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#ea4335",
                  color: "#fff",
                  fontSize: 9.5,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #fff"
                }}>
                  {alertsList.length}
                </span>
              )}
            </button>

            {/* Google Multi-Color Avatar */}
            <div style={{
              width: 34, height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ea4335 0%, #fbbc04 50%, #34a853 100%)",
              padding: 2,
              cursor: "pointer"
            }}>
              <div style={{
                width: "100%", height: "100%",
                borderRadius: "50%",
                background: "#ffffff",
                color: "#1a73e8",
                fontSize: 13,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {getUserFirstName()[0]}
              </div>
            </div>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  style={{
                    position: "absolute",
                    top: 48,
                    right: 0,
                    width: 340,
                    background: "#ffffff",
                    borderRadius: 18,
                    border: "1px solid #e1e3e1",
                    boxShadow: "0 8px 24px rgba(60,64,67,0.15)",
                    padding: 16,
                    zIndex: 50
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottom: "1px solid #f1f3f4", paddingBottom: 8 }}>
                    <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: "#1f1f1f" }}>
                      System Alerts ({alertsList.length})
                    </h4>
                    <button onClick={() => setShowNotifications(false)} style={{ border: "none", background: "transparent", color: "#5f6368", cursor: "pointer" }}>
                      <X size={15} />
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
                    {alertsList.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "20px 0", color: "#5f6368", fontSize: 12 }}>
                        No current alerts. All systems normal.
                      </div>
                    ) : (
                      alertsList.map((alt, aIdx) => (
                        <div key={alt.id || aIdx} style={{ padding: "10px 12px", borderRadius: 12, background: "#fef7e0", border: "1px solid #feefc3", display: "flex", gap: 8 }}>
                          <AlertTriangle size={15} color="#b06000" style={{ marginTop: 2, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#1f1f1f" }}>{alt.title || alt.productName || 'Low Stock Alert'}</div>
                            <div style={{ fontSize: 11, color: "#5f6368" }}>{alt.message || `${alt.productName || 'Product'}: ${alt.onHand ?? 0} in stock`}</div>
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
          padding: "24px 28px",
          background: "#f8fafd"
        }}>
          <div style={{ maxWidth: 1400, margin: "0 auto" }}>
            <RouteTransition>
              <Outlet />
            </RouteTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
