import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  TrendingUp, ShoppingBag, ClipboardList, Users,
  ArrowUpRight, Package, Box, ChevronRight, CheckCircle2,
  DollarSign, Sparkles
} from "lucide-react";
import { useErp } from "../../context/ErpContext";

const BENTO_CARD = {
  background: "#ffffff",
  borderRadius: "24px",
  border: "1px solid rgba(0, 0, 0, 0.04)",
  boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.03)",
  padding: "24px",
};

export default function Dashboard() {
  const { metrics, orders, products, customers, formatCurrency, hasPermission } = useErp();

  // Multi-month trajectory for Orders Overview
  const ordersTrajectoryData = useMemo(() => [
    { month: "Jan", orders: 12000, profit: 24000 },
    { month: "Feb", orders: 19000, profit: 29000 },
    { month: "Mar", orders: 32000, profit: 34000 },
    { month: "Apr", orders: 54000, profit: 42000 },
    { month: "May", orders: 38000, profit: 31000 },
    { month: "Jun", orders: 68000, profit: 26000 },
    { month: "Jul", orders: 48000, profit: 42000 },
    { month: "Aug", orders: 74000, profit: 38000 },
    { month: "Sep", orders: 62000, profit: 49000 },
    { month: "Oct", orders: 81000, profit: 43000 },
  ], []);

  // Purchase Analytics dual comparison
  const purchaseAnalyticsData = useMemo(() => [
    { month: "Jan", sold: 18000, purchased: 22000 },
    { month: "Feb", sold: 26000, purchased: 19000 },
    { month: "Mar", sold: 42000, purchased: 38000 },
    { month: "Apr", sold: 61000, purchased: 49000 },
    { month: "May", sold: 52000, purchased: 44000 },
    { month: "Jun", sold: 78000, purchased: 65000 },
    { month: "Jul", sold: 89000, purchased: 71000 },
    { month: "Aug", sold: 95000, purchased: 82000 },
  ], []);

  // Sale Analytics Donut Data
  const saleAnalyticsData = [
    { name: "Completed", value: 65, color: "#06b6d4" },
    { name: "Distributed", value: 20, color: "#f97316" },
    { name: "Returned", value: 15, color: "#8b5cf6" },
  ];

  // Top Products List
  const topProductsList = (products && products.length > 0) ? products.slice(0, 4) : [
    { id: "1", name: "Solid Teak Table", sku: "8812", price: "₹45,000", avatarBg: "#f3e8ff", emoji: "🪑" },
    { id: "2", name: "Ergonomic Lounge", sku: "8832", price: "₹28,500", avatarBg: "#e0f2fe", emoji: "🛋️" },
    { id: "3", name: "Modern Wardrobe", sku: "9871", price: "₹64,000", avatarBg: "#ffedd5", emoji: "🚪" },
    { id: "4", name: "Executive Desk", sku: "2211", price: "₹19,200", avatarBg: "#ecfdf5", emoji: "💼" },
  ];

  const totalRev = metrics?.totalRevenue || 85500;
  const totalOrdCount = orders?.length || metrics?.totalOrders || 1000;
  const totalCustCount = customers?.length || metrics?.totalCustomers || 300;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Main Top Bento Grid (2 Columns: Left Stats + Right Analytics) ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "360px 1fr",
        gap: 20,
        alignItems: "stretch"
      }}>

        {/* ── Left Column: Sales Overview Stacked Cards + Mini Sales Card ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* Sales Overview Container */}
          <div style={{ ...BENTO_CARD, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#18181b", letterSpacing: "-0.3px" }}>
              Sales Overview
            </div>

            {/* Card 1: Pastel Peach (Total Revenue) */}
            <div style={{
              background: "#fff6ea",
              borderRadius: "20px",
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              border: "1px solid rgba(249, 115, 22, 0.12)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: "#fed7aa", color: "#ea580c",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 800
                }}>
                  $
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#18181b", letterSpacing: "-0.5px" }}>
                    {formatCurrency ? formatCurrency(totalRev) : `$${totalRev.toLocaleString()}`}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>
                    Total Revenue
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: "#16a34a" }}>
                <ArrowUpRight size={14} strokeWidth={2.5} />
                <span>10.5%</span>
                <span style={{ color: "#94a3b8", fontWeight: 500 }}>From Last Day</span>
              </div>
            </div>

            {/* Card 2: Pastel Lavender (Total Orders) */}
            <div style={{
              background: "#f4effe",
              borderRadius: "20px",
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              border: "1px solid rgba(147, 51, 234, 0.1)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: "#e9d5ff", color: "#9333ea",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <ClipboardList size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#18181b", letterSpacing: "-0.5px" }}>
                    {totalOrdCount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>
                    Total Orders
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: "#16a34a" }}>
                <ArrowUpRight size={14} strokeWidth={2.5} />
                <span>10.5%</span>
                <span style={{ color: "#94a3b8", fontWeight: 500 }}>From Last Day</span>
              </div>
            </div>

            {/* Card 3: Pastel Mint / Aqua (Total Customers) */}
            <div style={{
              background: "#e6fbfb",
              borderRadius: "20px",
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              border: "1px solid rgba(13, 148, 136, 0.1)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: "#ccfbf1", color: "#0d9488",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Users size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#18181b", letterSpacing: "-0.5px" }}>
                    {totalCustCount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>
                    Total Customers
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: "#16a34a" }}>
                <ArrowUpRight size={14} strokeWidth={2.5} />
                <span>10.5%</span>
                <span style={{ color: "#94a3b8", fontWeight: 500 }}>From Last Day</span>
              </div>
            </div>
          </div>

          {/* Sales Quick Telemetry Card */}
          <div style={{ ...BENTO_CARD, padding: "20px 24px" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#18181b", marginBottom: 14 }}>
              Sales
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, textAlign: "left" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Total Sales</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#18181b", marginTop: 4 }}>9,586</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>This Month</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#18181b", marginTop: 4 }}>9,586</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Today</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#18181b", marginTop: 4 }}>9,586</div>
              </div>
            </div>
            <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: "#16a34a" }}>
              <ArrowUpRight size={14} strokeWidth={2.5} />
              <span>20% increased</span>
            </div>
          </div>
        </div>

        {/* ── Right Column: Orders Overview + (Sale Analytics & Top Products) ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* Orders Overview Large Chart Card */}
          <div style={{ ...BENTO_CARD, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#18181b" }}>
                Orders Overview
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 12, fontWeight: 600 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f97316" }} />
                  <span style={{ color: "#64748b" }}>Orders</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#8b5cf6" }} />
                  <span style={{ color: "#64748b" }}>Profit</span>
                </div>
              </div>
            </div>

            {/* Spline Chart */}
            <div style={{ width: "100%", height: 250, position: "relative" }}>
              {/* Highlight Pin Tag Badge */}
              <div style={{
                position: "absolute",
                top: 48,
                left: "60%",
                background: "#e2fc52",
                color: "#18181b",
                padding: "3px 10px",
                borderRadius: "8px",
                fontSize: 11,
                fontWeight: 800,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                zIndex: 10
              }}>
                21,345
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ordersTrajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="profitGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => v === 0 ? "0" : `${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ background: '#fff', borderRadius: '14px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Area type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#orderGrad)" />
                  <Area type="monotone" dataKey="profit" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#profitGrad2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sub Row: Sale Analytics Donut + Top Products Table */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            
            {/* Sale Analytics Gauge Card */}
            <div style={{ ...BENTO_CARD }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#18181b", marginBottom: 12 }}>
                Sale Analytics
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", height: 180 }}>
                {/* Center Label */}
                <div style={{
                  position: "absolute",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#18181b" }}>100%</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>Completed</div>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={saleAnalyticsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {saleAnalyticsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Callout Badges */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, marginTop: 4 }}>
                <span style={{ color: "#06b6d4" }}>70% Returned</span>
                <span style={{ color: "#f97316" }}>20% Completed</span>
                <span style={{ color: "#8b5cf6" }}>10% Distributed</span>
              </div>
            </div>

            {/* Top Products Table Card */}
            <div style={{ ...BENTO_CARD }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#18181b" }}>
                  Top Products
                </div>
                <Link to="/layout/products" style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", textDecoration: "none" }}>
                  View all
                </Link>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Table Header */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 600, color: "#94a3b8", paddingBottom: 4, borderBottom: "1px solid #f8fafc" }}>
                  <span>Product</span>
                  <span>Code</span>
                </div>

                {topProductsList.map((item, idx) => (
                  <div key={item.id || idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: item.avatarBg || "#f3e8ff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14
                      }}>
                        {item.emoji || "📦"}
                      </div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#18181b" }}>
                        {item.name}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>
                      {item.sku || "8812"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ── Bottom Section: Purchase Analytics (Full Width Card) ── */}
      <div style={{ ...BENTO_CARD }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#18181b" }}>
            Purchase Analytics
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 12, fontWeight: 600 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f97316" }} />
              <span style={{ color: "#64748b" }}>Sold</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#06b6d4" }} />
              <span style={{ color: "#64748b" }}>Purchased</span>
            </div>
          </div>
        </div>

        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={purchaseAnalyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="soldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="purchGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => v === 0 ? "0" : `${v / 1000}k`} />
              <Tooltip
                contentStyle={{ background: '#fff', borderRadius: '14px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
              />
              <Area type="monotone" dataKey="sold" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#soldGrad)" />
              <Area type="monotone" dataKey="purchased" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#purchGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
