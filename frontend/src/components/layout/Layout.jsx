import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { 
  Package, Users, ShoppingCart, LogOut, LayoutDashboard, Settings, 
  Factory, Bell, AlertTriangle, CheckCircle2, X, Shield, 
  Box, Truck, FileText, ChevronRight, Search, Moon, Sun,
  Layers, ArrowUpRight, Check, Activity, Sliders, Warehouse,
  Building2, ChevronDown, UserCheck, Sparkles
} from "lucide-react";
import { useErp } from "../../context/ErpContext";
import RouteTransition from "./RouteTransition";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, authUser, metrics, dashboardMetrics, logoutUser, hasPermission } = useErp();
  
  // Interactive UI State
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [clearedAlerts, setClearedAlerts] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('mini_erp_theme') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

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
        { name: "Sales & Orders",     path: "/layout/sales",      icon: ShoppingCart,    count: metrics?.pendingDeliveries > 0 ? `${metrics.pendingDeliveries}` : null, perm: 'sales.view' },
        { name: "Product Catalog",    path: "/layout/products",   icon: Box,             count: null,                      perm: 'inventory.view' },
        { name: "Inventory & Stock",  path: "/layout/inventory",  icon: Warehouse,       count: metrics?.lowStockCount > 0 ? `${metrics.lowStockCount}` : null, alert: metrics?.lowStockCount > 0, perm: 'inventory.view' },
      ]
    },
    {
      title: "SUPPLY CHAIN & PRODUCTION",
      items: [
        { name: "Procurement & POs",  path: "/layout/purchase",   icon: FileText,        count: metrics?.pendingReceipts > 0 ? `${metrics.pendingReceipts}` : null, perm: 'purchase.view' },
        { name: "Shop Floor (MOs)",   path: "/layout/production", icon: Factory,         count: metrics?.activeManufacturing > 0 ? `${metrics.activeManufacturing}` : null, perm: 'manufacturing.view' },
        { name: "Vendor Directory",   path: "/layout/suppliers",  icon: Truck,           count: null,                      perm: 'suppliers.view' },
        { name: "Customer Accounts",  path: "/layout/customers",  icon: Users,           count: null,                      perm: 'customers.view' },
      ]
    },
    {
      title: "ADMINISTRATION",
      items: [
        { name: "Team & Roles",       path: "/layout/users",      icon: Shield,          count: null,                      perm: 'admin' },
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

  const getUserFullName = () => {
    return user?.name || user?.firstName ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : (authUser?.name || 'Administrator');
  };

  const getUserInitial = () => {
    const name = getUserFullName();
    return name ? name.charAt(0).toUpperCase() : 'A';
  };

  const userEmail = authUser?.email || user?.email || 'admin@shivfurniture.in';
  const employeeId = authUser?.employeeId || user?.employeeId || 'ADMIN01';

  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path === "/layout" || path === "/layout/") return "Executive Dashboard";
    if (path.includes("/sales")) return "Sales & Orders";
    if (path.includes("/products")) return "Product Catalog";
    if (path.includes("/inventory")) return "Inventory & Stock";
    if (path.includes("/purchase")) return "Procurement & POs";
    if (path.includes("/production")) return "Shop Floor (MOs)";
    if (path.includes("/suppliers")) return "Vendor Directory";
    if (path.includes("/customers")) return "Customer Accounts";
    if (path.includes("/users")) return "Team & Roles";
    if (path.includes("/settings")) return "System Settings";
    return "Operations";
  };

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      overflow: "hidden",
      background: "var(--canvas)",
      color: "var(--text-primary)",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>

      {/* ── Enterprise Clean Sidebar ─────────────────────────────── */}
      <aside style={{
        width: 240, flexShrink: 0,
        display: "flex", flexDirection: "column",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        padding: "12px 10px",
        position: "relative",
        zIndex: 20
      }}>

        {/* Workspace Brand Identifier */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "6px 8px 12px",
          marginBottom: 10,
          borderBottom: "1px solid var(--border)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 5,
              background: "#0f172a",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#ffffff", fontSize: 11, fontWeight: 700, letterSpacing: "-0.02em"
            }}>
              SF
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                Shiv Furniture
              </div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 400 }}>
                shivfurniture.in
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", paddingRight: 2 }}>
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
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: "var(--text-tertiary)",
                  letterSpacing: "0.04em",
                  padding: "0 8px 4px",
                  textTransform: "uppercase"
                }}>
                  {section.title}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
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
                          padding: "6px 8px",
                          borderRadius: "6px",
                          textDecoration: "none",
                          color: active ? "var(--accent)" : "var(--text-secondary)",
                          background: active ? "var(--surface-hover)" : "transparent",
                          fontWeight: active ? 600 : 450,
                          fontSize: 12.5,
                          transition: "all 0.1s ease"
                        }}
                        onMouseEnter={e => {
                          if (!active) e.currentTarget.style.background = "var(--surface-hover)";
                        }}
                        onMouseLeave={e => {
                          if (!active) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <item.icon size={15} strokeWidth={active ? 2 : 1.6} />
                          <span>{item.name}</span>
                        </div>

                        {item.count && (
                          <span style={{
                            fontSize: 10.5,
                            fontWeight: 600,
                            padding: "1px 5px",
                            borderRadius: "3px",
                            background: item.alert ? "var(--warning-bg)" : "var(--surface-hover)",
                            color: item.alert ? "var(--warning)" : "var(--text-secondary)"
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
          borderTop: "1px solid var(--border)",
          paddingTop: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div
            onClick={() => setShowProfile(true)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "4px 6px", borderRadius: 6, cursor: "pointer",
              flex: 1, minWidth: 0,
              transition: "background 0.1s ease"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--surface-hover)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: "#0f172a", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 600, flexShrink: 0
            }}>
              {getUserInitial()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {getUserFullName()}
              </div>
              <div style={{ fontSize: 10.5, color: "var(--text-tertiary)" }}>
                {employeeId} • {currentRole}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            style={{
              background: "transparent", border: "none", color: "var(--text-tertiary)",
              cursor: "pointer", padding: "5px", borderRadius: 4
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--danger)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-tertiary)"; }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* ── Main Workspace Area ─────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden" }}>
        
        {/* Crisp Enterprise Header Bar */}
        <header style={{
          height: 44,
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0
        }}>
          {/* Breadcrumbs Navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--text-tertiary)" }}>
            <span style={{ fontWeight: 450 }}>Shiv Furniture</span>
            <ChevronRight size={13} />
            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
              {getBreadcrumbTitle()}
            </span>
          </div>

          {/* Right Action Tools */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
            
            {/* Live Database Sync Indicator (Clean, no clunky pill) */}
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 11.5, fontWeight: 500, color: "var(--text-secondary)",
              padding: "2px 6px"
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)" }} />
              <span>Synced</span>
            </div>

            {/* Dark Mode Switch */}
            <button
              onClick={toggleDarkMode}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              style={{
                width: 28, height: 28, borderRadius: 5, border: "1px solid var(--border)",
                background: "transparent", color: "var(--text-secondary)",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
              }}
            >
              {darkMode ? <Sun size={13} /> : <Moon size={13} />}
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
                width: 28, height: 28, borderRadius: 5,
                border: "1px solid var(--border)",
                background: showNotifications ? "var(--surface-hover)" : "transparent",
                color: "var(--text-secondary)",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
              }}
            >
              <Bell size={13} />
              {alertsList.length > 0 && (
                <span style={{
                  position: "absolute", top: -2, right: -2,
                  width: 6, height: 6, borderRadius: "50%", background: "var(--danger)"
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
                width: 26, height: 26, borderRadius: "50%",
                background: "#0f172a", color: "#ffffff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 600, cursor: "pointer"
              }}
            >
              {getUserInitial()}
            </div>

            {/* ── Notification Popover ────────────────────────── */}
            {showNotifications && (
              <div
                style={{
                  position: "absolute", top: 38, right: 0,
                  width: 320, background: "var(--surface)",
                  borderRadius: 8, border: "1px solid var(--border)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 100,
                  overflow: "hidden"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>
                    Operational Alerts
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                    {alertsList.length} alerts
                  </span>
                </div>

                <div style={{ maxHeight: 240, overflowY: "auto", padding: "6px" }}>
                  {alertsList.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px 10px", color: "var(--text-tertiary)", fontSize: 12 }}>
                      No active operational alerts.
                    </div>
                  ) : (
                    alertsList.map((alt, idx) => (
                      <div key={idx} style={{
                        padding: "8px 10px", borderRadius: 5,
                        background: "var(--surface-hover)", marginBottom: 4,
                        fontSize: 12, display: "flex", alignItems: "flex-start", gap: 8
                      }}>
                        <AlertTriangle size={13} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{alt.title || 'Stock Alert'}</div>
                          <div style={{ color: "var(--text-secondary)", fontSize: 11.5 }}>{alt.message || alt.text || 'Action required'}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ── User Profile Popover ────────────────────────── */}
            {showProfile && (
              <div
                style={{
                  position: "absolute", top: 38, right: 0,
                  width: 240, background: "var(--surface)",
                  borderRadius: 8, border: "1px solid var(--border)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 100,
                  overflow: "hidden"
                }}
              >
                <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                    {getUserFullName()}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 2 }}>
                    {userEmail}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, marginTop: 4 }}>
                    {employeeId} • {currentRole}
                  </div>
                </div>

                <div style={{ padding: "4px" }}>
                  <Link
                    to="/layout/settings"
                    onClick={() => setShowProfile(false)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "7px 10px", borderRadius: 5,
                      fontSize: 12, color: "var(--text-primary)",
                      textDecoration: "none"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--surface-hover)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <Settings size={13} />
                    <span>Account Settings</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      width: "100%", padding: "7px 10px", borderRadius: 5,
                      fontSize: 12, color: "var(--danger)",
                      background: "transparent", border: "none", cursor: "pointer",
                      textAlign: "left"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--danger-bg)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </header>

        {/* ── Dynamic Page Content Viewport ───────────────────── */}
        <main style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px",
          background: "var(--canvas)"
        }}>
          <RouteTransition>
            <Outlet />
          </RouteTransition>
        </main>

      </div>

    </div>
  );
}
