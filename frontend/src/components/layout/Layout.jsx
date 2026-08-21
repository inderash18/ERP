import { useState } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { Package, Users, ShoppingCart, LogOut, LayoutDashboard, Settings, Factory, Bell, AlertTriangle, CheckCircle2, RotateCcw, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useErp } from "../../context/ErpContext";
import RouteTransition from "./RouteTransition";
import LiquidCursor from "../common/LiquidCursor";
import { 
  CharMorph, TextFlip, ClipReveal,
  ElasticText, PerspectiveText, TextShuffle
} from "../common/AnimatedText";

/* One animation per nav item — plays only when that item becomes active */
const NAV_ANIM = [
  (t) => <CharMorph       text={t} stagger={0.04}  />,
  (t) => <TextShuffle     text={t} duration={600}  />,
  (t) => <TextFlip        text={t} stagger={0.05}  />,
  (t) => <ElasticText     text={t} stagger={0.04}  />,
  (t) => <PerspectiveText text={t} stagger={0.05}  />,
  (t) => <ClipReveal      text={t} stagger={0.04}  />,
  (t) => <TextShuffle     text={t} duration={500}  />,
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, metrics, resetToDefaultData, logoutUser } = useErp();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard",    path: "/layout",            icon: LayoutDashboard, count: null },
    { name: "Inventory",    path: "/layout/inventory",  icon: Package,         count: metrics.lowStockCount > 0 ? `${metrics.lowStockCount} low` : null, alert: metrics.lowStockCount > 0 },
    { name: "Sales",        path: "/layout/sales",      icon: ShoppingCart,    count: metrics.activeOrdersCount > 0 ? `${metrics.activeOrdersCount}` : null },
    { name: "Production",   path: "/layout/production", icon: Factory,         count: metrics.activeBatchesCount > 0 ? `${metrics.activeBatchesCount}` : null },
    { name: "Customers",    path: "/layout/customers",  icon: Users,           count: null },
    { name: "Users & RBAC", path: "/layout/users",      icon: Shield,          count: null },
    { name: "Settings",     path: "/layout/settings",   icon: Settings,        count: null },
  ];

  const isActive = (path) => {
    if (path === "/layout")
      return location.pathname === "/layout" || location.pathname === "/layout/";
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#e8eee9" }}>

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside style={{
        width: 250, flexShrink: 0,
        display: "flex", flexDirection: "column",
        background: "#fff",
        borderRight: "1px solid #d4ddd6",
        boxShadow: "2px 0 16px rgba(30,50,40,0.06)",
        position: "relative",
        zIndex: 20
      }}>

        {/* Logo */}
        <div style={{ padding: "24px 20px 18px", borderBottom: "1px solid #e8eee9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, background: "#405b4d",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px",
              boxShadow: "0 2px 8px rgba(64,91,77,0.3)"
            }}>ERP</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#17241d", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
                Mini-ERP
              </div>
              <span style={{ fontSize: 11, color: "#8a968f", fontWeight: 500 }}>
                Live Operations v2.4
              </span>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f2", background: "#fafcfb" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "#2d5a45", color: "#ffffff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700
            }}>
              {user?.avatar || "AR"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#17241d", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name || "Alexander Reed"}
              </div>
              <div style={{ fontSize: 11, color: "#8a968f", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.role || "Operations Director"}
              </div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 0 2px #d1fae5" }} title="Live Online" />
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "14px 10px", display: "flex", flexDirection: "column", gap: 3, overflowY: "auto" }}>
          {navItems.map((item, idx) => {
            const active     = isActive(item.path);
            const renderText = NAV_ANIM[idx];

            return (
              <Link
                key={item.name}
                to={item.path}
                style={{
                  display: "flex", alignItems: "center", gap: 11,
                  padding: "9px 12px", borderRadius: 12,
                  textDecoration: "none",
                  color:      active ? "#405b4d" : "#6b7c71",
                  background: active ? "#e8eee9" : "transparent",
                  fontWeight: active ? 660 : 500,
                  fontSize: 13.5,
                  transition: "background 0.18s, color 0.18s",
                  position: "relative"
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#f3f7f4"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                {/* Icon */}
                <motion.span
                  key={`${item.path}-${active}`}
                  initial={active ? { scale: 0.75 } : { scale: 1 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 20 }}
                  style={{ display: "flex", flexShrink: 0 }}
                >
                  <item.icon size={17} />
                </motion.span>

                {/* Text */}
                <span style={{ flex: 1, display: "flex", alignItems: "center", minHeight: 20 }}>
                  <AnimatePresence mode="wait">
                    {active ? (
                      <motion.span key={`on-${item.path}`} style={{ display: "inline-flex" }}>
                        {renderText(item.name)}
                      </motion.span>
                    ) : (
                      <motion.span
                        key={`off-${item.path}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>

                {/* Dynamic count badge */}
                {item.count && (
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 10,
                    background: item.alert ? "#fef3c7" : "#e2e8f0",
                    color: item.alert ? "#92400e" : "#475569",
                    lineHeight: 1.2
                  }}>
                    {item.count}
                  </span>
                )}

                {/* Active dot */}
                <AnimatePresence>
                  {active && (
                    <motion.div
                      key="dot"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{   scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      style={{ width: 6, height: 6, borderRadius: "50%", background: "#405b4d", flexShrink: 0 }}
                    />
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Quick system reset & Logout */}
        <div style={{ padding: "10px 12px", borderTop: "1px solid #e8eee9", display: "flex", flexDirection: "column", gap: 4 }}>
          <button
            onClick={() => {
              if (window.confirm("Reset all ERP data to default demo datasets?")) {
                resetToDefaultData();
              }
            }}
            style={{
              display: "flex", alignItems: "center", gap: 9, width: "100%",
              padding: "7px 10px", borderRadius: 8, border: "none",
              background: "transparent", color: "#8a968f",
              fontSize: 12, fontWeight: 500, cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#2d5a45"; e.currentTarget.style.background = "#eef4f0"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#8a968f"; e.currentTarget.style.background = "transparent"; }}
          >
            <RotateCcw size={14} />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 9, width: "100%",
              padding: "7px 10px", borderRadius: 8, border: "none",
              background: "transparent", color: "#8b948e",
              fontSize: 12.5, fontWeight: 500, cursor: "pointer",
              transition: "color 0.15s, background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#c0392b"; e.currentTarget.style.background = "#fdf0ee"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#8b948e"; e.currentTarget.style.background = "transparent"; }}
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Page content + Top Bar ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh" }}>
        
        {/* Top Live Bar */}
        <header style={{
          height: 60,
          background: "#ffffff",
          borderBottom: "1px solid #d4ddd6",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          boxShadow: "0 2px 10px rgba(30,50,40,0.02)",
          position: "relative",
          zIndex: 10
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 20,
              background: "#ecfdf5",
              color: "#059669",
              border: "1px solid #d1fae5"
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }} />
              Live Dynamic Reactive Sync
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                position: "relative",
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1px solid #d1ded5",
                background: showNotifications ? "#e8eee9" : "#ffffff",
                color: "#405b4d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              <Bell size={17} />
              {metrics.alerts.length > 0 && (
                <span style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #fff"
                }}>
                  {metrics.alerts.length}
                </span>
              )}
            </button>

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
                    borderRadius: 14,
                    border: "1px solid #d4ddd6",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                    padding: 16,
                    zIndex: 50
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottom: "1px solid #f1f5f2", paddingBottom: 8 }}>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#17241d" }}>
                      Live Alerts ({metrics.alerts.length})
                    </h4>
                    <button
                      onClick={() => setShowNotifications(false)}
                      style={{ border: "none", background: "transparent", color: "#94a3b8", cursor: "pointer", padding: 2 }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
                    {metrics.alerts.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: 12 }}>
                        No current alerts. All systems normal.
                      </div>
                    ) : (
                      metrics.alerts.map((alt) => (
                        <div
                          key={alt.id}
                          style={{
                            padding: "10px 12px",
                            borderRadius: 10,
                            background: alt.type === "warning" ? "#fffbeb" : "#eff6ff",
                            border: `1px solid ${alt.type === "warning" ? "#fef3c7" : "#dbeafe"}`,
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10
                          }}
                        >
                          {alt.type === "warning" ? (
                            <AlertTriangle size={16} color="#d97706" style={{ marginTop: 2, flexShrink: 0 }} />
                          ) : (
                            <CheckCircle2 size={16} color="#2563eb" style={{ marginTop: 2, flexShrink: 0 }} />
                          )}
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: alt.type === "warning" ? "#92400e" : "#1e40af" }}>
                              {alt.title}
                            </div>
                            <div style={{ fontSize: 11, color: alt.type === "warning" ? "#b45309" : "#3b82f6", marginTop: 2 }}>
                              {alt.desc}
                            </div>
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

        {/* Main page content scroll area */}
        <main className="scroll-container" style={{ flex: 1, overflowY: "auto", background: "#e8eee9" }}>
          <div style={{ padding: 28, maxWidth: 1360, margin: "0 auto", minHeight: "100%" }}>
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
}
