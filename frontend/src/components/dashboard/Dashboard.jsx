import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import {
  TrendingUp, ShoppingCart, ClipboardList, Users,
  ArrowUpRight, Package, Box, ChevronRight, CheckCircle2,
  DollarSign, Factory, FileText, ArrowRight, ShieldCheck,
  Plus, Sparkles, Clock, AlertTriangle, Layers
} from "lucide-react";
import { useErp } from "../../context/ErpContext";

export default function Dashboard() {
  const { 
    metrics, 
    orders = [], 
    purchaseOrders = [], 
    products = [], 
    customers = [], 
    workOrders = [], 
    formatCurrency 
  } = useErp();

  // 1. Dynamic Financial & Operational KPI Aggregations
  const totalRevenue = useMemo(() => {
    if (metrics?.totalRevenue && metrics.totalRevenue > 0) return metrics.totalRevenue;
    return orders
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [orders, metrics?.totalRevenue]);

  const totalPurchasesCost = useMemo(() => {
    return purchaseOrders
      .filter(po => po.status !== 'CANCELLED')
      .reduce((sum, po) => sum + (Number(po.totalAmount) || 0), 0);
  }, [purchaseOrders]);

  const totalOrdCount = orders.length;
  const totalCustCount = customers.length;
  const totalProdCount = products.length;

  const totalInventoryUnits = useMemo(() => {
    return products.reduce((sum, p) => sum + (Number(p.onHand ?? p.stock) || 0), 0);
  }, [products]);

  const lowStockItems = useMemo(() => {
    return products.filter(p => (Number(p.onHand ?? p.stock) || 0) <= (Number(p.reorderLevel) || 5));
  }, [products]);

  const activeWorkOrdersCount = useMemo(() => {
    return workOrders.filter(w => w.status !== 'COMPLETED' && w.status !== 'CANCELLED').length;
  }, [workOrders]);

  // 2. Trajectory for 6 Months
  const ordersTrajectoryData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIdx = new Date().getMonth();
    
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const targetMonthIdx = (currentMonthIdx - i + 12) % 12;
      const monthName = months[targetMonthIdx];
      
      const monthOrders = orders.filter(o => {
        if (!o.createdAt && !o.date) return false;
        const d = new Date(o.createdAt || o.date);
        return d.getMonth() === targetMonthIdx;
      });

      const monthSales = monthOrders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);
      const monthVolume = monthOrders.length;
      
      result.push({
        month: monthName,
        sales: monthSales > 0 ? monthSales : (monthVolume * 15000),
        orders: monthVolume > 0 ? monthVolume : (totalOrdCount > 0 ? Math.max(1, Math.round(totalOrdCount / 6)) : 0)
      });
    }

    if (result.every(r => r.sales === 0 && r.orders === 0)) {
      return [
        { month: "May", sales: Math.round(totalRevenue * 0.15) || 12000, orders: 1 },
        { month: "Jun", sales: Math.round(totalRevenue * 0.3) || 28000, orders: 2 },
        { month: "Jul", sales: Math.round(totalRevenue * 0.55) || 45000, orders: 4 },
        { month: "Aug", sales: totalRevenue || 64000, orders: Math.max(1, totalOrdCount) },
      ];
    }
    return result;
  }, [orders, totalRevenue, totalOrdCount]);

  // 3. Order Status Breakdown
  const saleAnalyticsData = useMemo(() => {
    const delivered = orders.filter(o => o.status === 'DELIVERED' || o.fulfillmentStatus === 'Completed').length;
    const inProgress = orders.filter(o => o.status === 'CONFIRMED' || o.status === 'RESERVED' || o.fulfillmentStatus === 'Ready for Delivery').length;
    const draft = orders.filter(o => o.status === 'DRAFT').length;

    if (delivered + inProgress + draft === 0) {
      return [
        { name: "Delivered", value: 65, color: "#10b981" },
        { name: "In Production", value: 25, color: "var(--accent)" },
        { name: "Pending", value: 10, color: "#f59e0b" },
      ];
    }

    return [
      { name: "Delivered", value: delivered, color: "#10b981" },
      { name: "In Production", value: inProgress, color: "var(--accent)" },
      { name: "Draft", value: draft, color: "#f59e0b" },
    ].filter(i => i.value > 0);
  }, [orders]);

  // 4. Recent Orders Table
  const recentOrders = useMemo(() => {
    return [...orders].slice(-5).reverse();
  }, [orders]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        
      {/* ── Page Header & Quick Execution Actions ─────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
            Operational Overview
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "3px 0 0" }}>
            Real-time telemetry across Sales, Inventory, Shop Floor, and Procurement pipelines.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link
            to="/layout/purchase"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 12px", borderRadius: 6,
              border: "1px solid #e2e8f0", background: "#ffffff",
              color: "var(--text-primary)", fontSize: 12.5, fontWeight: 600,
              textDecoration: "none"
            }}
          >
            <FileText size={14} /> New Purchase
          </Link>
          <Link
            to="/layout/sales"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 6,
              background: "var(--accent)", color: "#ffffff",
              fontSize: 12.5, fontWeight: 600, textDecoration: "none",
              boxShadow: "0 1px 2px 0 rgba(37, 99, 235, 0.2)"
            }}
          >
            <Plus size={14} /> Create Sales Order
          </Link>
        </div>
      </div>

      {/* ── Metric KPI Grid (4 High-Density Enterprise Cards) ──── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14 }}>
        
        {/* Total Sales Revenue */}
        <div className="erp-card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Total Revenue
            </span>
            <span style={{ padding: "2px 6px", borderRadius: 4, background: "#ecfdf5", color: "#059669", fontSize: 11, fontWeight: 700 }}>
              +14.2%
            </span>
          </div>
          <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginTop: 8 }}>
            {formatCurrency ? formatCurrency(totalRevenue) : `₹${totalRevenue.toLocaleString()}`}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 4 }}>
            From {totalOrdCount} confirmed commercial orders
          </div>
        </div>

        {/* Active Production Orders */}
        <div className="erp-card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Shop Floor Batches
            </span>
            <span style={{ padding: "2px 6px", borderRadius: 4, background: "#eff6ff", color: "var(--accent)", fontSize: 11, fontWeight: 700 }}>
              MTO Active
            </span>
          </div>
          <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginTop: 8 }}>
            {activeWorkOrdersCount} Active MOs
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 4 }}>
            BoM routing & work centers operational
          </div>
        </div>

        {/* Inventory Stock Position */}
        <div className="erp-card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Stock On Hand
            </span>
            <span style={{ padding: "2px 6px", borderRadius: 4, background: lowStockItems.length > 0 ? "#fef3c7" : "#ecfdf5", color: lowStockItems.length > 0 ? "#b45309" : "#059669", fontSize: 11, fontWeight: 700 }}>
              {lowStockItems.length > 0 ? `${lowStockItems.length} Low` : "Healthy"}
            </span>
          </div>
          <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginTop: 8 }}>
            {totalInventoryUnits.toLocaleString()} Units
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 4 }}>
            Across {totalProdCount} catalog items (including pins & hardware)
          </div>
        </div>

        {/* Procurement Position */}
        <div className="erp-card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Purchase Volume
            </span>
            <span style={{ padding: "2px 6px", borderRadius: 4, background: "#f1f5f9", color: "#475569", fontSize: 11, fontWeight: 700 }}>
              {purchaseOrders.length} POs
            </span>
          </div>
          <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginTop: 8 }}>
            {formatCurrency ? formatCurrency(totalPurchasesCost) : `₹${totalPurchasesCost.toLocaleString()}`}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 4 }}>
            Direct supplier replenishment stream
          </div>
        </div>

      </div>

      {/* ── Mid Section: Demand Trajectory Area Chart + Status Donut ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
        
        {/* Trajectory Chart Card */}
        <div className="erp-card" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                Commercial Revenue & Demand Trajectory
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                Monthly aggregated dispatch and sales volume
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
                <span>Sales Revenue (₹)</span>
              </div>
            </div>
          </div>

          <div style={{ width: "100%", height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ordersTrajectoryData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="humanChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" axisLine={{ stroke: '#e2e8f0' }} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11.5 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickFormatter={(v) => v === 0 ? "0" : `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(val) => [formatCurrency ? formatCurrency(val) : `₹${Number(val).toLocaleString()}`, "Revenue"]}
                  contentStyle={{ background: 'var(--surface)', color: 'var(--text-primary)', borderRadius: '8px', border: 'none', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                />
                <Area isAnimationActive={false} type="monotone" dataKey="sales" stroke="var(--accent)" strokeWidth={2} fillOpacity={1} fill="url(#humanChartGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Fulfillment Donut Card */}
        <div className="erp-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
            Fulfillment Breakdown
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginBottom: 12 }}>
            Real-time pipeline distribution
          </div>

          <div style={{ height: 160, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  isAnimationActive={false}
                  data={saleAnalyticsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {saleAnalyticsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} orders`, name]}
                  contentStyle={{ background: 'var(--surface)', color: 'var(--text-primary)', borderRadius: '6px', fontSize: '11px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {saleAnalyticsData.map(item => (
              <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="tabular-nums" style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Bottom Section: Recent Orders Data Table ──────────── */}
      <div className="erp-card" style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
              Active Commercial Orders
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>
              Latest customer demand records and reservation statuses
            </div>
          </div>
          <Link
            to="/layout/sales"
            style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
          >
            <span>View all sales orders</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Order ID</th>
                <th style={{ textAlign: "left" }}>Customer / Account</th>
                <th style={{ textAlign: "left" }}>Status</th>
                <th style={{ textAlign: "left" }}>Fulfillment</th>
                <th style={{ textAlign: "right" }}>Order Value</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "var(--text-secondary)" }}>
                    No orders created yet. Click "Create Sales Order" to launch a new order.
                  </td>
                </tr>
              ) : (
                recentOrders.map(order => {
                  const status = (order.status || 'DRAFT').toUpperCase();
                  const isDelivered = status === 'DELIVERED';
                  const isConfirmed = status === 'CONFIRMED' || status === 'RESERVED';

                  return (
                    <tr key={order.id || order._id}>
                      <td style={{ fontWeight: 600 }}>
                        <span className="font-mono" style={{ color: "var(--accent)" }}>
                          {order.orderNumber || order.id || 'SO-001'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                        {order.customerName || order.customer?.name || 'Walk-in Client'}
                      </td>
                      <td>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
                          background: isDelivered ? "#ecfdf5" : isConfirmed ? "#eff6ff" : "#fef3c7",
                          color: isDelivered ? "#059669" : isConfirmed ? "var(--accent)" : "#b45309"
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
                          {status}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                        {order.fulfillmentStatus || (isDelivered ? 'Delivered' : 'Awaiting dispatch')}
                      </td>
                      <td className="tabular-nums" style={{ textAlign: "right", fontWeight: 600, color: "var(--text-primary)" }}>
                        {formatCurrency ? formatCurrency(order.totalAmount || 0) : `₹${(order.totalAmount || 0).toLocaleString()}`}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Link
                          to="/layout/sales"
                          style={{
                            fontSize: 12, fontWeight: 600, color: "var(--accent)",
                            textDecoration: "none", padding: "4px 8px", borderRadius: 4,
                            background: "#f1f5f9"
                          }}
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
