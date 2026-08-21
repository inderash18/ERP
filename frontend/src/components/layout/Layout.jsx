import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { 
  Package, Users, ShoppingCart, LogOut, LayoutDashboard, Settings, 
  Factory, Bell, AlertTriangle, CheckCircle2, RotateCcw, X, Shield, 
  Box, Truck, FileText, ChevronRight, Search, Moon, Sun, HelpCircle,
  Plus, Sparkles, Command, SlidersHorizontal, User, Key, ExternalLink,
  Check
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

  const rawAlerts = metrics?.alerts || dashboardMetrics?.lowStockAlerts || [];
  const alertsList = clearedAlerts ? [] : rawAlerts;

  const getUserFirstName = () => {
    const fullName = user?.name || user?.firstName || authUser?.name || 'Admin';
    return fullName.split(' ')[0];
  };

  const userEmail = authUser?.email || user?.email || 'admin@shivfurniture.in';
  const employeeId = authUser?.employeeId || user?.employeeId || 'ADMIN01';

  // Dynamic Theme Colors
  const theme = {
    bg: darkMode ? "#0f1115" : "#f8fafd",
    canvas: darkMode ? "#14171d" : "#f8fafd",
    headerBg: darkMode ? "#181b20" : "#ffffff",
    headerBorder: darkMode ? "rgba(255, 255, 255, 0.08)" : "#e1e3e1",
    sidebarBg: darkMode ? "rgba(20, 23, 29, 0.95)" : "rgba(242, 246, 252, 0.85)",
    sidebarBorder: darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
    cardBg: darkMode ? "#1e2229" : "#ffffff",
    cardBorder: darkMode ? "rgba(255, 255, 255, 0.08)" : "#e1e3e1",
    textPrimary: darkMode ? "#f1f3f4" : "#1f1f1f",
    textSecondary: darkMode ? "#9aa0a6" : "#5f6368",
    searchBg: darkMode ? "#22262d" : "#edf2fa",
    searchBorder: darkMode ? "#333842" : "#dadce0",
    navActiveBg: darkMode ? "#1e3a5f" : "#d3e3fd",
    navActiveText: darkMode ? "#7cb342" : "#0b57d0",
    navHoverBg: darkMode ? "#1c2027" : "#e9eef6",
  };

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      overflow: "hidden",
      background: theme.bg,
      color: theme.textPrimary,
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      transition: "background 0.2s ease, color 0.2s ease"
    }}>

      {/* ── macOS Frosted Acrylic Sidebar ──────────────────────── */}
      <aside style={{
        width: 255, flexShrink: 0,
        display: "flex", flexDirection: "column",
        background: theme.sidebarBg,
        backdropFilter: "blur(30px) saturate(190%)",
        borderRight: `1px solid ${theme.sidebarBorder}`,
        padding: "16px 14px 14px",
        position: "relative",
        zIndex: 20,
        transition: "background 0.2s ease, border-color 0.2s ease"
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
            <div style={{ fontSize: 15, fontWeight: 700, color: theme.textPrimary, letterSpacing: "-0.2px", lineHeight: 1.2 }}>
              Shiv Furniture
            </div>
            <div style={{ fontSize: 11, color: theme.textSecondary, fontWeight: 500 }}>
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
                  color: active ? (darkMode ? "#93c5fd" : "#0b57d0") : theme.textSecondary,
                  background: active ? (darkMode ? "#1e3a5f" : "#d3e3fd") : "transparent",
                  fontWeight: active ? 600 : 500,
                  fontSize: 13.5,
                  transition: "all 0.15s ease",
                  position: "relative"
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.background = theme.navHoverBg;
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
                  style={{ display: "flex", flexShrink: 0, color: active ? (darkMode ? "#93c5fd" : "#0b57d0") : theme.textSecondary }}
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
                    background: item.alert ? (darkMode ? "#451a03" : "#fef3c7") : (darkMode ? "#2c313a" : "#e0e3e7"),
                    color: item.alert ? "#f59e0b" : theme.textSecondary
                  }}>
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div style={{ marginTop: "auto", borderTop: `1px solid ${theme.sidebarBorder}`, paddingTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            onClick={() => setShowProfile(true)}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "6px 8px",
              borderRadius: "12px", cursor: "pointer", transition: "background 0.15s ease"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = theme.navHoverBg; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "#1a73e8", color: "#ffffff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700
            }}>
              {getUserFirstName()[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name || getUserFirstName()}
              </div>
              <div style={{ fontSize: 11, color: theme.textSecondary }}>
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
            onMouseEnter={e => { e.currentTarget.style.background = darkMode ? "#3b1717" : "#fce8e6"; }}
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
          background: theme.headerBg,
          borderBottom: `1px solid ${theme.headerBorder}`,
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          boxShadow: darkMode ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 3px rgba(60,64,67,0.08)",
          transition: "background 0.2s ease, border-color 0.2s ease"
        }}>
          {/* Google-Style Global Search Capsule */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: theme.searchBg,
            borderRadius: "9999px",
            padding: "8px 18px",
            width: 440,
            transition: "all 0.2s ease"
          }}>
            <Search size={17} color={theme.textSecondary} />
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
                color: theme.textPrimary,
                width: "100%"
              }}
            />
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              background: theme.cardBg,
              color: theme.textSecondary,
              padding: "2px 6px",
              borderRadius: 6,
              border: `1px solid ${theme.searchBorder}`
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
              background: darkMode ? "#14331d" : "#e6f4ea",
              padding: "4px 12px",
              borderRadius: "9999px",
              border: darkMode ? "1px solid #1e4627" : "1px solid #ceead6"
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34a853" }} />
              MongoDB Connected
            </div>

            {/* Dark Mode Toggle Switch Button */}
            <button
              onClick={toggleDarkMode}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: "none",
                background: darkMode ? "#262b33" : "#f1f3f4",
                color: darkMode ? "#fbbc04" : "#444746",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              title="System Alerts & Notifications"
              style={{
                position: "relative",
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: "none",
                background: showNotifications ? (darkMode ? "#1e3a5f" : "#e8f0fe") : "transparent",
                color: theme.textSecondary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = theme.navHoverBg; }}
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
                  border: `2px solid ${theme.headerBg}`
                }}>
                  {alertsList.length}
                </span>
              )}
            </button>

            {/* Google Multi-Color Profile Avatar Trigger */}
            <div
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              title="Account & Profile Menu"
              style={{
                width: 36, height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ea4335 0%, #fbbc04 50%, #34a853 100%)",
                padding: 2.5,
                cursor: "pointer",
                transition: "transform 0.15s ease",
                boxShadow: showProfile ? "0 0 0 3px rgba(66, 133, 244, 0.35)" : "none"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <div style={{
                width: "100%", height: "100%",
                borderRadius: "50%",
                background: theme.cardBg,
                color: "#1a73e8",
                fontSize: 14,
                fontWeight: 900,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {getUserFirstName()[0]}
              </div>
            </div>

            {/* ── Interactive Profile Dropdown Modal ──────────── */}
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  style={{
                    position: "absolute",
                    top: 52,
                    right: 0,
                    width: 320,
                    background: theme.cardBg,
                    borderRadius: 20,
                    border: `1px solid ${theme.cardBorder}`,
                    boxShadow: darkMode ? "0 12px 32px rgba(0,0,0,0.6)" : "0 12px 32px rgba(60,64,67,0.18)",
                    padding: "20px 18px 16px",
                    zIndex: 60
                  }}
                >
                  {/* Profile Header */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingBottom: 16, borderBottom: `1px solid ${theme.cardBorder}` }}>
                    <div style={{
                      width: 58, height: 58, borderRadius: "50%",
                      background: "linear-gradient(135deg, #4285f4 0%, #34a853 100%)",
                      color: "#fff", fontSize: 24, fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginBottom: 10,
                      boxShadow: "0 4px 14px rgba(66, 133, 244, 0.3)"
                    }}>
                      {getUserFirstName()[0]}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary }}>
                      {user?.name || `${user?.firstName || 'Admin'} ${user?.lastName || 'User'}`}
                    </div>
                    <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
                      {userEmail}
                    </div>

                    {/* Role & ID Badges */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: "9999px",
                        background: darkMode ? "#1e3a5f" : "#e8f0fe", color: "#1a73e8"
                      }}>
                        {currentRole}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: "9999px",
                        background: theme.searchBg, color: theme.textSecondary
                      }}>
                        ID: {employeeId}
                      </span>
                    </div>
                  </div>

                  {/* Organization & Quick Options */}
                  <div style={{ padding: "12px 0", display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 10 }}>
                      <span style={{ fontSize: 12, color: theme.textSecondary, fontWeight: 500 }}>Organization</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: theme.textPrimary }}>Shiv Furniture Works</span>
                    </div>

                    {/* Quick Dark Mode Toggle */}
                    <div
                      onClick={toggleDarkMode}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "10px", borderRadius: 12, cursor: "pointer",
                        background: theme.searchBg, transition: "all 0.15s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {darkMode ? <Sun size={16} color="#fbbc04" /> : <Moon size={16} color="#5f6368" />}
                        <span style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary }}>
                          {darkMode ? "Dark Theme Active" : "Light Theme Active"}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#1a73e8" }}>Toggle</span>
                    </div>

                    {/* Settings Navigation */}
                    <Link
                      to="/layout/settings"
                      onClick={() => setShowProfile(false)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px", borderRadius: 12, textDecoration: "none",
                        color: theme.textPrimary, fontSize: 13, fontWeight: 500,
                        transition: "background 0.15s ease"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = theme.searchBg; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <Settings size={16} color={theme.textSecondary} />
                      <span>Account Settings</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/layout/users"
                        onClick={() => setShowProfile(false)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px", borderRadius: 12, textDecoration: "none",
                          color: theme.textPrimary, fontSize: 13, fontWeight: 500,
                          transition: "background 0.15s ease"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = theme.searchBg; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <Shield size={16} color={theme.textSecondary} />
                        <span>Manage Team & Access</span>
                      </Link>
                    )}
                  </div>

                  {/* Sign Out Button */}
                  <div style={{ borderTop: `1px solid ${theme.cardBorder}`, paddingTop: 10 }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: "100%",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        padding: "10px", borderRadius: "9999px", border: "none",
                        background: darkMode ? "#3b1717" : "#fce8e6",
                        color: "#d93025", fontSize: 13, fontWeight: 700,
                        cursor: "pointer", transition: "all 0.15s ease"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                    >
                      <LogOut size={15} />
                      <span>Sign out of Shiv Furniture</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Notification Dropdown Modal ──────────────────── */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  style={{
                    position: "absolute",
                    top: 52,
                    right: 48,
                    width: 340,
                    background: theme.cardBg,
                    borderRadius: 18,
                    border: `1px solid ${theme.cardBorder}`,
                    boxShadow: darkMode ? "0 12px 32px rgba(0,0,0,0.6)" : "0 8px 24px rgba(60,64,67,0.15)",
                    padding: 16,
                    zIndex: 60
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottom: `1px solid ${theme.cardBorder}`, paddingBottom: 8 }}>
                    <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: theme.textPrimary }}>
                      System Alerts ({alertsList.length})
                    </h4>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {alertsList.length > 0 && (
                        <button
                          onClick={() => setClearedAlerts(true)}
                          style={{ border: "none", background: "transparent", color: "#1a73e8", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                        >
                          Clear all
                        </button>
                      )}
                      <button onClick={() => setShowNotifications(false)} style={{ border: "none", background: "transparent", color: theme.textSecondary, cursor: "pointer" }}>
                        <X size={15} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
                    {alertsList.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "24px 0", color: theme.textSecondary, fontSize: 12 }}>
                        <CheckCircle2 size={24} color="#34a853" style={{ margin: "0 auto 8px" }} />
                        <div>No active alerts.</div>
                        <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>All stock and order streams are healthy.</div>
                      </div>
                    ) : (
                      alertsList.map((alt, aIdx) => (
                        <div key={alt.id || aIdx} style={{ padding: "10px 12px", borderRadius: 12, background: darkMode ? "#2a2215" : "#fef7e0", border: darkMode ? "1px solid #4a3b1a" : "1px solid #feefc3", display: "flex", gap: 8 }}>
                          <AlertTriangle size={15} color="#b06000" style={{ marginTop: 2, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: theme.textPrimary }}>{alt.title || alt.productName || 'Low Stock Alert'}</div>
                            <div style={{ fontSize: 11, color: theme.textSecondary }}>{alt.message || `${alt.productName || 'Product'}: ${alt.onHand ?? 0} in stock`}</div>
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
          background: theme.canvas,
          transition: "background 0.2s ease"
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
