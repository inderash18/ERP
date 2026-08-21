import { Package, Plus, Filter, ArrowUpDown, Search, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const CARD_STYLE = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e1ebe4',
  boxShadow: '0 4px 18px -2px rgba(28, 48, 38, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
};

const items = [
  { sku: "SKU-9021", name: "Aluminum Extrusion Bar (6063-T6)", category: "Raw Materials", stock: 450, min: 100, status: "In Stock", unit: "kg" },
  { sku: "SKU-8842", name: "Precision Roller Bearing 25mm", category: "Components", stock: 1240, min: 300, status: "In Stock", unit: "pcs" },
  { sku: "SKU-7721", name: "High-Tensile Hex Bolt M8x40", category: "Fasteners", stock: 85, min: 200, status: "Low Stock", unit: "boxes" },
  { sku: "SKU-6519", name: "Hydraulic Fluid Type IV (20L)", category: "Consumables", stock: 18, min: 15, status: "Adequate", unit: "drums" },
  { sku: "SKU-5402", name: "Tempered Glass Panel 600x800", category: "Finished Goods", stock: 320, min: 50, status: "In Stock", unit: "pcs" },
];

export default function Inventory() {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#0f172a', fontSize: '26px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            Inventory Management
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '13px' }}>
            Track warehouses, stock levels, reorder thresholds, and bin allocations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: '10px', background: '#ffffff', border: '1px solid #d1ded5', color: '#334155', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <Filter size={15} /> Filter
          </button>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: '10px', background: '#2d5a45', border: 'none', color: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(45,90,69,0.25)' }}>
            <Plus size={16} /> Add Item
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Catalog SKUs</span>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>1,740</div>
        </div>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Healthy Stock Items</span>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#059669', marginTop: 4 }}>1,682</div>
        </div>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Under Reorder Limit</span>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#d97706', marginTop: 4 }}>58 Items</div>
        </div>
      </div>

      {/* Inventory Table */}
      <div style={{ ...CARD_STYLE, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #eef3f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8faf9', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e1ebe4', width: '280px' }}>
            <Search size={15} color="#94a3b8" />
            <input type="text" placeholder="Search SKU or item name..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', color: '#1e293b', width: '100%' }} />
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Showing 5 of 1,740 items</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8faf9', borderBottom: '1px solid #e1ebe4', color: '#475569', fontSize: '12px', fontWeight: 600 }}>
              <th style={{ padding: '12px 20px' }}>SKU Code</th>
              <th style={{ padding: '12px 20px' }}>Item Description</th>
              <th style={{ padding: '12px 20px' }}>Category</th>
              <th style={{ padding: '12px 20px' }}>In-Hand Qty</th>
              <th style={{ padding: '12px 20px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f3', transition: 'background 0.12s' }}>
                <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontWeight: 600, color: '#2d5a45' }}>{row.sku}</td>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: '#0f172a' }}>{row.name}</td>
                <td style={{ padding: '14px 20px', color: '#64748b' }}>{row.category}</td>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: '#1e293b' }}>{row.stock} {row.unit}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: row.status === 'Low Stock' ? '#fffbeb' : '#ecfdf5',
                    color: row.status === 'Low Stock' ? '#b45309' : '#059669',
                  }}>
                    {row.status === 'Low Stock' ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
