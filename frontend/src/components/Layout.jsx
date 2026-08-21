import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { Package, Users, ShoppingCart, LogOut, LayoutDashboard, Settings, Factory } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CharMorph, TextFlip, ClipReveal,
  ElasticText, PerspectiveText, TextShuffle,
} from "./AnimatedText";

/* One animation per nav item — plays only when that item becomes active */
const NAV_ANIM = [
  (t) => <CharMorph       text={t} stagger={0.04}  />,
  (t) => <TextShuffle     text={t} duration={600}  />,
  (t) => <TextFlip        text={t} stagger={0.05}  />,
  (t) => <ElasticText     text={t} stagger={0.04}  />,
  (t) => <PerspectiveText text={t} stagger={0.05}  />,
  (t) => <ClipReveal      text={t} stagger={0.04}  />,
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard",  path: "/layout",            icon: LayoutDashboard },
    { name: "Inventory",  path: "/layout/inventory",  icon: Package         },
    { name: "Sales",      path: "/layout/sales",      icon: ShoppingCart    },
    { name: "Production", path: "/layout/production", icon: Factory         },
    { name: "Customers",  path: "/layout/customers",  icon: Users           },
    { name: "Settings",   path: "/layout/settings",   icon: Settings        },
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
        width: 240, flexShrink: 0,
        display: "flex", flexDirection: "column",
        background: "#fff",
        borderRight: "1px solid #d4ddd6",
        boxShadow: "2px 0 16px rgba(30,50,40,0.06)",
      }}>

        {/* Logo */}
        <div style={{ padding: "26px 22px 20px", borderBottom: "1px solid #e8eee9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
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
        <nav style={{ flex: 1, padding: "14px 10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
          {navItems.map((item, idx) => {
            const active     = isActive(item.path);
            const renderText = NAV_ANIM[idx];

            return (
              <Link
                key={item.name}
                to={item.path}
                style={{
                  display: "flex", alignItems: "center", gap: 11,
                  padding: "10px 12px", borderRadius: 12,
                  textDecoration: "none",
                  color:      active ? "#405b4d" : "#6b7c71",
                  background: active ? "#e8eee9" : "transparent",
                  fontWeight: active ? 660 : 500,
                  fontSize: 14,
                  transition: "background 0.18s, color 0.18s",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#f3f7f4"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                {/* Icon — tiny spring pop when activated */}
                <motion.span
                  key={`${item.path}-${active}`}
                  initial={active ? { scale: 0.75 } : { scale: 1 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 20 }}
                  style={{ display: "flex", flexShrink: 0 }}
                >
                  <item.icon size={17} />
                </motion.span>

                {/* Text — animated only on the active item */}
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

        {/* Logout */}
        <div style={{ padding: "10px", borderTop: "1px solid #e8eee9" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 11, width: "100%",
              padding: "10px 12px", borderRadius: 12, border: "none",
              background: "transparent", color: "#8b948e",
              fontSize: 14, fontWeight: 500, cursor: "pointer",
              transition: "color 0.15s, background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#c0392b"; e.currentTarget.style.background = "#fdf0ee"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#8b948e"; e.currentTarget.style.background = "transparent"; }}
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Page content — gentle fade only, no overlay ── */}
      <main className="scroll-container" style={{ flex: 1, overflowY: "auto", background: "#e8eee9" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.22, ease: "easeOut" } }}
            exit={{   opacity: 0, transition: { duration: 0.15, ease: "easeIn"  } }}
            style={{ padding: 32, maxWidth: 1280, margin: "0 auto" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}
