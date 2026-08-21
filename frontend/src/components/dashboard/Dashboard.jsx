import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import {
  Package, TrendingUp, AlertCircle, CheckCircle2,
  ShoppingCart, Users, ArrowUpRight, Clock, Plus, Factory, ChevronRight, Settings
} from "lucide-react";
import { useErp } from "../../context/ErpContext";
import { TextShuffle } from "../common/AnimatedText";

const CARD_STYLE = {
  background: "#ffffff",
  borderRadius: "18px",
  border: "1px solid #d4ddd6",
  boxShadow: "0 4px 18px -2px rgba(28, 48, 38, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)",
};

/* KPI Card component */
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
            flexShrink: 0,
          }}
        >
          <Icon size={22} />
        </div>
      </div>

      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, fontSize: "12px" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            fontWeight: 700,
            color: trend === "up" ? "#059669" : "#d97706",
            background: trend === "up" ? "#ecfdf5" : "#fffbeb",
            padding: "2px 6px",
            borderRadius: "6px",
          }}
        >
          {trend === "up" ? <ArrowUpRight size={13} /> : <AlertCircle size={13} />}
          {change}
        </span>
        <span style={{ color: "#94a3b8" }}>vs dynamic threshold</span>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { metrics, orders, activities, formatCurrency } = useErp();

  const recentOrders = (orders || []).slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Banner & Quick Shortcuts */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ color: "#0f172a", fontSize: "28px", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
            <TextShuffle text="Live Operations Dashboard" duration={700} />
          </h1>
          <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: "14px" }}>
            Real-time telemetry, production capacity, inventory balances, and automated sales execution.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            to="/layout/sales"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 16px",
              borderRadius: "11px",
              background: "#2563eb",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
              transition: "transform 0.15s"
            }}
          >
            <ShoppingCart size={15} /> + New Order
          </Link>
          <Link
            to="/layout/inventory"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 16px",
              borderRadius: "11px",
              background: "#2d5a45",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(45,90,69,0.25)",
              transition: "transform 0.15s"
            }}
          >
            <Package size={15} /> Add Inventory
          </Link>
          <Link
            to="/layout/production"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 16px",
              borderRadius: "11px",
              background: "#7c3aed",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(124,58,237,0.25)",
              transition: "transform 0.15s"
            }}
          >
            <Factory size={15} /> Launch Batch
          </Link>
          <Link
            to="/layout/customers"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 16px",
              borderRadius: "11px",
              background: "#059669",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(5,150,105,0.25)",
              transition: "transform 0.15s"
            }}
          >
            <Users size={15} /> View Customers
          </Link>
          <Link
            to="/layout/settings"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 16px",
              borderRadius: "11px",
              background: "#475569",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(71,85,105,0.25)",
              transition: "transform 0.15s"
            }}
          >
            <Settings size={15} /> Settings
          </Link>
        </div>
      </div>

      {/* Real-Time KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        <StatCard
          title="Total Gross Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          change={`+${orders.length} orders`}
          icon={TrendingUp}
          trend="up"
          color="#059669"
          bg="#ecfdf5"
          delay={0}
        />
        <StatCard
          title="Active Sales Orders"
          value={`${metrics.activeOrdersCount} Active`}
          change={`${orders.filter(o => o.fulfillmentStatus === 'Delivered').length} Delivered`}
          icon={ShoppingCart}
          trend="up"
          color="#2563eb"
          bg="#eff6ff"
          delay={0.06}
        />
        <StatCard
          title="Catalog SKUs & Stock"
          value={`${metrics.totalCatalogItems} SKUs`}
          change={metrics.lowStockCount > 0 ? `${metrics.lowStockCount} Low Stock` : "All Healthy"}
          icon={Package}
          trend={metrics.lowStockCount > 0 ? "warn" : "up"}
          color="#d97706"
          bg="#fffbeb"
          delay={0.12}
        />
        <StatCard
          title="Production Batches"
          value={`${metrics.activeBatchesCount} Running`}
          change="92.4% OEE"
          icon={Factory}
          trend="up"
          color="#7c3aed"
          bg="#f5f3ff"
          delay={0.18}
        />
      </div>

      {/* Dynamic Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 20 }}>
        {/* Revenue & Margin Dynamics */}
        <div style={{ ...CARD_STYLE, padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Revenue & Profit Trajectory
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0" }}>
                Computed dynamically from current order volume & margin models
              </p>
            </div>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#059669", background: "#ecfdf5", padding: "4px 8px", borderRadius: "6px" }}>
              Live
            </span>
          </div>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={metrics.monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid #e1ebe4', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  formatter={(val) => [formatCurrency(val), ""]}
                />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#profitGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Category Stock Volume */}
        <div style={{ ...CARD_STYLE, padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Stock Distribution by Category
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0" }}>
                Real-time total units stored across warehouses
              </p>
            </div>
            <Link to="/layout/inventory" style={{ fontSize: "12px", fontWeight: 600, color: "#2d5a45", textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
              Inventory <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={metrics.categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid #e1ebe4', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  formatter={(val) => [`${val} Units`, "Available Stock"]}
                />
                <Bar dataKey="units" radius={[8, 8, 0, 0]}>
                  {metrics.categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || '#2d5a45'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Orders + Live Dynamic Activity Log */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 20 }}>
        {/* Recent Dynamic Orders */}
        <div style={{ ...CARD_STYLE, overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid #eef3f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Recent Sales Orders
              </h3>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Latest customer transactions</span>
            </div>
            <Link to="/layout/sales" style={{ fontSize: "12px", fontWeight: 600, color: "#2563eb", textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
              View all orders <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f8faf9", borderBottom: "1px solid #e1ebe4", color: "#64748b", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>
                  <th style={{ padding: "10px 18px" }}>Order ID</th>
                  <th style={{ padding: "10px 18px" }}>Customer</th>
                  <th style={{ padding: "10px 18px" }}>Amount</th>
                  <th style={{ padding: "10px 18px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => (
                  <tr key={ord.id} style={{ borderBottom: "1px solid #f1f5f3" }}>
                    <td style={{ padding: "12px 18px", fontFamily: "monospace", fontWeight: 600, color: "#2563eb" }}>
                      {ord.id}
                    </td>
                    <td style={{ padding: "12px 18px", fontWeight: 600, color: "#0f172a" }}>
                      {ord.customerName}
                    </td>
                    <td style={{ padding: "12px 18px", fontWeight: 700, color: "#1e293b" }}>
                      {formatCurrency(ord.totalAmount)}
                    </td>
                    <td style={{ padding: "12px 18px" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 600,
                        background: ord.fulfillmentStatus === "Delivered" ? "#ecfdf5" : ord.fulfillmentStatus === "Ready for Dispatch" ? "#eff6ff" : "#fffbeb",
                        color: ord.fulfillmentStatus === "Delivered" ? "#059669" : ord.fulfillmentStatus === "Ready for Dispatch" ? "#2563eb" : "#d97706",
                      }}>
                        {ord.fulfillmentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Event Stream / Activity Feed */}
        <div style={{ ...CARD_STYLE, padding: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Live System Activity Feed
              </h3>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Real-time event logging</span>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669", background: "#ecfdf5", padding: "3px 8px", borderRadius: "20px" }}>
              Active
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 250, overflowY: "auto" }}>
            {(activities || []).slice(0, 7).map((act) => (
              <div key={act.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 10px", borderRadius: "10px", background: "#fafcfb", border: "1px solid #f1f5f2" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "8px",
                  background: act.type === "order" ? "#eff6ff" : act.type === "stock" ? "#ecfdf5" : act.type === "production" ? "#f5f3ff" : "#fffbeb",
                  color: act.type === "order" ? "#2563eb" : act.type === "stock" ? "#059669" : act.type === "production" ? "#7c3aed" : "#d97706",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2
                }}>
                  {act.type === "order" ? <ShoppingCart size={14} /> : act.type === "stock" ? <Package size={14} /> : act.type === "production" ? <Factory size={14} /> : <AlertCircle size={14} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "12.5px", color: "#1e293b", fontWeight: 500, lineHeight: 1.4 }}>
                    {act.text}
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#94a3b8", marginTop: 2 }}>
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
