import { Link, useLocation, useNavigate } from "react-router-dom";
import { Package, Users, ShoppingCart, LogOut, LayoutDashboard, Settings, Factory } from "lucide-react";
import RouteTransition from "./RouteTransition";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard",  path: "/layout",             icon: LayoutDashboard },
    { name: "Inventory",  path: "/layout/inventory",   icon: Package },
    { name: "Sales",      path: "/layout/sales",       icon: ShoppingCart },
    { name: "Production", path: "/layout/production",  icon: Factory },
    { name: "Customers",  path: "/layout/customers",   icon: Users },
    { name: "Settings",   path: "/layout/settings",    icon: Settings },
  ];

  const isActive = (path) => {
    if (path === "/layout") return location.pathname === "/layout" || location.pathname === "/layout/";
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#e8eee9" }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, display: "flex", flexDirection: "column",
        background: "#fff", borderRight: "1px solid #d4ddd6",
        boxShadow: "2px 0 16px rgba(30,50,40,0.06)", flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: "28px 24px 22px", borderBottom: "1px solid #e8eee9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: "#405b4d",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px",
            }}>ERP</div>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#17241d", letterSpacing: "-0.3px" }}>
              Mini-ERP
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link key={item.name} to={item.path} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 12, textDecoration: "none",
                color: active ? "#405b4d" : "#6b7c71",
                background: active ? "#e8eee9" : "transparent",
                fontWeight: active ? 650 : 500,
                fontSize: 14, transition: "all 0.15s ease",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#f3f7f4"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <item.icon size={17} />
                <span style={{ flex: 1 }}>{item.name}</span>
                {active && (
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#405b4d" }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: "12px", borderTop: "1px solid #e8eee9" }}>
          <button onClick={handleLogout} style={{
            display: "flex", alignItems: "center", gap: 12, width: "100%",
            padding: "10px 12px", borderRadius: 12, border: "none",
            background: "transparent", color: "#8b948e", fontSize: 14,
            fontWeight: 500, cursor: "pointer", transition: "all 0.15s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#c0392b"; e.currentTarget.style.background = "#fdf0ee"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#8b948e"; e.currentTarget.style.background = "transparent"; }}
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main — RouteTransition owns Outlet + all cinematic effects */}
      <RouteTransition />
    </div>
  );
}
