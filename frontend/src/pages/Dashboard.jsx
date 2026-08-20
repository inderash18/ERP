import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
  Package, TrendingUp, AlertCircle, CheckCircle2,
  ShoppingCart, Users, ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react';

const revenueData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4500 },
  { name: 'May', value: 6000 },
  { name: 'Jun', value: 5500 },
  { name: 'Jul', value: 7000 },
];

const inventoryData = [
  { name: 'Raw Mats', value: 450 },
  { name: 'WIP', value: 120 },
  { name: 'Finished', value: 890 },
];

const activity = [
  { icon: ShoppingCart, label: 'New order #1042 received', time: '2 min ago', color: '#405b4d' },
  { icon: Package, label: 'Stock replenishment: Steel Rods', time: '18 min ago', color: '#6b7c71' },
  { icon: AlertCircle, label: 'Low stock alert: Copper Wire', time: '45 min ago', color: '#b45309' },
  { icon: Users, label: 'New customer: Apex Industries', time: '1h ago', color: '#405b4d' },
  { icon: CheckCircle2, label: 'Production batch #88 complete', time: '2h ago', color: '#405b4d' },
];

const card = {
  background: '#fff',
  borderRadius: '20px',
  boxShadow: '0 4px 24px rgba(30,50,40,0.07)',
  border: '1px solid #d4ddd6',
};

const StatCard = ({ title, value, change, icon: Icon, trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: 'spring', stiffness: 200, damping: 22 }}
    style={{ ...card, padding: '24px', position: 'relative', overflow: 'hidden' }}
  >
    {/* Subtle corner accent */}
    <div style={{
      position: 'absolute', top: 0, right: 0, width: 80, height: 80,
      background: trend === 'up' ? 'rgba(64,91,77,0.05)' : 'rgba(180,83,9,0.05)',
      borderRadius: '0 20px 0 80px',
    }} />

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ color: '#6b7c71', fontSize: 12, fontWeight: 500, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {title}
        </p>
        <h3 style={{ color: '#17241d', fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{value}</h3>
      </div>
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: trend === 'up' ? '#e8eee9' : '#fef3c7',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: trend === 'up' ? '#405b4d' : '#b45309',
      }}>
        <Icon size={20} />
      </div>
    </div>

    <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
      {trend === 'up'
        ? <ArrowUpRight size={14} color="#405b4d" />
        : <ArrowDownRight size={14} color="#b45309" />}
      <span style={{ color: trend === 'up' ? '#405b4d' : '#b45309', fontSize: 13, fontWeight: 600 }}>{change}</span>
      <span style={{ color: '#9da49f', fontSize: 12 }}>vs last month</span>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}
      >
        <div>
          <p style={{ color: '#6b7c71', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
            {greeting} 👋
          </p>
          <h1 style={{ color: '#17241d', fontSize: 30, fontWeight: 700, lineHeight: 1.1 }}>
            Operations Overview
          </h1>
          <p style={{ color: '#9da49f', marginTop: 6, fontSize: 13 }}>
            Here's what's happening across your facilities today.
          </p>
        </div>
        <div style={{
          ...card,
          padding: '10px 18px',
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 13, color: '#6b7c71',
        }}>
          <Clock size={14} color="#405b4d" />
          {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        <StatCard title="Total Revenue" value="₹1,24,500" change="+12.5%" icon={TrendingUp} trend="up" delay={0.05} />
        <StatCard title="Active Orders" value="42" change="+5.2%" icon={ShoppingCart} trend="up" delay={0.10} />
        <StatCard title="Low Stock Alerts" value="7" change="-2.1%" icon={AlertCircle} trend="down" delay={0.15} />
        <StatCard title="Production Yield" value="98.2%" change="+0.4%" icon={CheckCircle2} trend="up" delay={0.20} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          style={{ ...card, padding: 28 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ color: '#17241d', fontSize: 15, fontWeight: 600 }}>Revenue Trajectory</h3>
            <span style={{
              background: '#e8eee9', color: '#405b4d', borderRadius: 8,
              padding: '4px 10px', fontSize: 12, fontWeight: 600
            }}>This Year</span>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#405b4d" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#405b4d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eee9" vertical={false} />
                <XAxis dataKey="name" stroke="#c5d0c8" tick={{ fill: '#9da49f', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#c5d0c8" tick={{ fill: '#9da49f', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #d4ddd6', borderRadius: 12, boxShadow: '0 4px 12px rgba(30,50,40,0.1)' }}
                  itemStyle={{ color: '#405b4d', fontWeight: 600 }}
                  labelStyle={{ color: '#17241d', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="value" stroke="#405b4d" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" dot={{ fill: '#405b4d', r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Inventory Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.30 }}
          style={{ ...card, padding: 28 }}
        >
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ color: '#17241d', fontSize: 15, fontWeight: 600 }}>Inventory Distribution</h3>
            <p style={{ color: '#9da49f', fontSize: 12, marginTop: 2 }}>Current stock levels by stage</p>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eee9" vertical={false} />
                <XAxis dataKey="name" stroke="#c5d0c8" tick={{ fill: '#9da49f', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#c5d0c8" tick={{ fill: '#9da49f', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#e8eee9' }}
                  contentStyle={{ background: '#fff', border: '1px solid #d4ddd6', borderRadius: 12, boxShadow: '0 4px 12px rgba(30,50,40,0.1)' }}
                  itemStyle={{ color: '#405b4d', fontWeight: 600 }}
                  labelStyle={{ color: '#17241d', fontWeight: 600 }}
                />
                <Bar dataKey="value" fill="#405b4d" radius={[8, 8, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        style={{ ...card, padding: 28 }}
      >
        <h3 style={{ color: '#17241d', fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Recent Activity</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {activity.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '13px 0',
                borderBottom: i < activity.length - 1 ? '1px solid #f0f4f1' : 'none',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: '#e8eee9', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: item.color, flexShrink: 0,
              }}>
                <item.icon size={16} />
              </div>
              <span style={{ color: '#3f4943', fontSize: 13, fontWeight: 500, flex: 1 }}>{item.label}</span>
              <span style={{ color: '#9da49f', fontSize: 12, whiteSpace: 'nowrap' }}>{item.time}</span>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}

