import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import {
  Package, TrendingUp, AlertCircle, CheckCircle2,
  ShoppingCart, Users, ArrowUpRight, ArrowDownRight, Clock, Sparkles,
} from "lucide-react";

/* ── Attractive Color Tokens & Data ─────────────────── */
const revenueData = [
  { name: "Jan", revenue: 4200, profit: 2100 },
  { name: "Feb", revenue: 3800, profit: 1950 },
  { name: "Mar", revenue: 5400, profit: 2800 },
  { name: "Apr", revenue: 4900, profit: 2600 },
  { name: "May", revenue: 6800, profit: 3700 },
  { name: "Jun", revenue: 6100, profit: 3400 },
  { name: "Jul", revenue: 7850, profit: 4250 },
];

const inventoryData = [
  { name: "Raw Mats", units: 580, fill: "#3b7258" },
  { name: "In Progress", units: 240, fill: "#3b82f6" },
  { name: "Finished Goods", units: 920, fill: "#8b5cf6" },
];

const activity = [
  { icon: ShoppingCart, label: "Order #1048 approved for dispatch", time: "2 min ago", color: "#2563eb", bg: "#eff6ff" },
  { icon: Package, label: "Stock replenishment: Aluminum Ingots (120 units)", time: "18 min ago", color: "#3b7258", bg: "#e9f4ee" },
  { icon: AlertCircle, label: "Low stock warning: Copper Coil (under 15%)", time: "42 min ago", color: "#d97706", bg: "#fffbeb" },
  { icon: Users, label: "Apex Global registered as Verified Vendor", time: "1h ago", color: "#7c3aed", bg: "#f5f3ff" },
  { icon: CheckCircle2, label: "Quality inspection passed for Batch #89", time: "2h ago", color: "#059669", bg: "#ecfdf5" },
];

const CARD_STYLE = {
  background: "#ffffff",
  borderRadius: "18px",
  border: "1px solid #e1ebe4",
  boxShadow: "0 4px 18px -2px rgba(28, 48, 38, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)",
};

/* ── Gentle KPI Card with refined accents ─── */
function StatCard({ title, value, change, icon: Icon, trend, color, bg, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.25, delay, ease: "easeOut" }}
      whileHover={{ y: -2, boxShadow: "0 8px 24px -4px rgba(28, 48, 38, 0.09)" }}
      style={{
        ...CARD_STYLE,
        padding: "20px 22px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
      }}
    >
      {/* Soft gradient aura behind the card corner */}
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: bg,
          opacity: 0.7,
          filter: "blur(18px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span style={{ color: "#64748b", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {title}
          </span>
          <h3 style={{ color: "#0f172a", fontSize: "26px", fontWeight: 700, margin: "6px 0 0", letterSpacing: "-0.02em" }}>
            {value}
          </h3>
        </div>

        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            background: bg,
            color: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `inset 0 0 0 1px ${color}20`,
          }}
        >
          <Icon size={20} />
        </div>
      </div>

      <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "2px",
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: "6px",
            background: trend === "up" ? "#ecfdf5" : "#fff1f2",
            color: trend === "up" ? "#059669" : "#e11d48",
          }}
        >
          {trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </span>
        <span style={{ color: "#94a3b8", fontSize: "12px" }}>vs last month</span>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── HEADER ───────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 99, background: "#e2eee6", color: "#2d5a45", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
            <Sparkles size={13} />
            <span>Operations Live Hub</span>
          </div>
          <h1 style={{ color: "#0f172a", fontSize: "28px", fontWeight: 700, margin: 0, letterSpacing: "-0.03em" }}>
            {greeting}, Administrator
          </h1>
          <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: "14px" }}>
            Here is a consolidated real-time overview of your enterprise metrics.
          </p>
        </div>

        {/* Date / Status pill */}
        <div
          style={{
            ...CARD_STYLE,
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "#334155",
            fontWeight: 500,
          }}
        >
          <Clock size={15} color="#2d5a45" />
          <span>{now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", marginLeft: 4 }} />
          <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>System Healthy</span>
        </div>
      </div>

      {/* ── 4 ATTRACTIVE KPI STAT CARDS ──────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        <StatCard
          title="Total Revenue"
          value="₹8,42,500"
          change="+12.4%"
          icon={TrendingUp}
          trend="up"
          color="#2d5a45"
          bg="#e7f1eb"
          delay={0.02}
        />
        <StatCard
          title="Active Orders"
          value="148 Orders"
          change="+8.3%"
          icon={ShoppingCart}
          trend="up"
          color="#2563eb"
          bg="#eff6ff"
          delay={0.04}
        />
        <StatCard
          title="Inventory Units"
          value="1,740 Units"
          change="-2.8%"
          icon={Package}
          trend="down"
          color="#d97706"
          bg="#fffbeb"
          delay={0.06}
        />
        <StatCard
          title="Active Customers"
          value="342 Clients"
          change="+15.2%"
          icon={Users}
          trend="up"
          color="#7c3aed"
          bg="#f5f3ff"
          delay={0.08}
        />
      </div>

      {/* ── CHARTS SECTION ───────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
        
        {/* Revenue Area Chart */}
        <div style={{ ...CARD_STYLE, padding: "22px 24px", gridColumn: "span 2" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <span style={{ color: "#64748b", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Financial Growth
              </span>
              <h3 style={{ color: "#0f172a", fontSize: "18px", fontWeight: 700, margin: "2px 0 0" }}>
                Revenue & Profit Trend (YTD)
              </h3>
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: "12px", fontWeight: 500 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#334155" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#2d5a45" }} /> Revenue
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#334155" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#38bdf8" }} /> Gross Profit
              </span>
            </div>
          </div>

          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d5a45" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2d5a45" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} stroke="#e2e8f0" />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} stroke="#e2e8f0" />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    borderRadius: "10px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2d5a45" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="profit" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#colorProf)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Status Bar Chart */}
        <div style={{ ...CARD_STYLE, padding: "22px 24px" }}>
          <div style={{ marginBottom: 18 }}>
            <span style={{ color: "#64748b", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Warehouse Breakdown
            </span>
            <h3 style={{ color: "#0f172a", fontSize: "18px", fontWeight: 700, margin: "2px 0 0" }}>
              Inventory Distribution
            </h3>
          </div>

          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} stroke="#e2e8f0" />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} stroke="#e2e8f0" />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    borderRadius: "10px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="units" radius={[6, 6, 0, 0]} fill="#2d5a45" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── RECENT ACTIVITY FEED ─────────────────────── */}
      <div style={{ ...CARD_STYLE, padding: "22px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <span style={{ color: "#64748b", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Audit Stream
            </span>
            <h3 style={{ color: "#0f172a", fontSize: "18px", fontWeight: 700, margin: "2px 0 0" }}>
              Recent Enterprise Activity
            </h3>
          </div>
          <span style={{ fontSize: "12px", color: "#2d5a45", fontWeight: 600, background: "#e7f1eb", padding: "4px 10px", borderRadius: "8px" }}>
            Live Feed
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {activity.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "10px 14px",
                borderRadius: "12px",
                background: "#f8faf9",
                border: "1px solid #eef3f0",
                transition: "background 0.15s ease",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  background: item.bg,
                  color: item.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <item.icon size={17} />
              </div>
              <span style={{ color: "#1e293b", fontSize: "13px", fontWeight: 500, flex: 1 }}>
                {item.label}
              </span>
              <span style={{ color: "#94a3b8", fontSize: "12px", whiteSpace: "nowrap" }}>
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
