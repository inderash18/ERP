import { useState, useMemo } from 'react';
import {
  Warehouse, Plus, Search, CheckCircle2, AlertTriangle, Trash2,
  Edit2, PlusCircle, MinusCircle, DollarSign, Filter, X, ArrowUpRight,
  TrendingDown, Layers, SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useErp } from '../../context/ErpContext';

const TABS = ["All Stock", "Low Stock Alerts", "Finished Goods", "Raw Materials", "Fasteners & Pins"];

export default function Inventory() {
  const {
    products = [],
    adjustStock,
    formatCurrency
  } = useErp();

  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('All Stock');
  const [adjustModalItem, setAdjustModalItem] = useState(null);
  const [adjustDelta, setAdjustDelta] = useState(1);
  const [adjustType, setAdjustType] = useState('add');

  const handleOpenAdjust = (item, type = 'add') => {
    setAdjustModalItem(item);
    setAdjustType(type);
    setAdjustDelta(type === 'add' ? 10 : 5);
  };

  const handleExecuteAdjust = async (e) => {
    e.preventDefault();
    if (!adjustModalItem) return;
    const delta = adjustType === 'add' ? Math.abs(Number(adjustDelta)) : -Math.abs(Number(adjustDelta));
    await adjustStock(adjustModalItem.id || adjustModalItem._id, delta);
    setAdjustModalItem(null);
  };

  // Filtered Stock Rows
  const filteredStock = useMemo(() => {
    return products.filter(p => {
      const q = search.toLowerCase();
      const catName = typeof p.category === 'object' && p.category ? p.category.name : (p.category || '');
      const matchesSearch = (p.name || '').toLowerCase().includes(q) ||
                            (p.sku || '').toLowerCase().includes(q) ||
                            catName.toLowerCase().includes(q);

      const onHand = Number(p.onHand ?? p.stock) || 0;
      const reorder = Number(p.reorderLevel ?? p.minStock) || 0;
      const isLow = onHand <= reorder;

      if (selectedTab === 'Low Stock Alerts') return matchesSearch && isLow;
      if (selectedTab === 'Finished Goods') return matchesSearch && p.type === 'Finished Good';
      if (selectedTab === 'Raw Materials') return matchesSearch && p.type === 'Raw Material';
      if (selectedTab === 'Fasteners & Pins') return matchesSearch && (p.type === 'Component' || catName.includes('Hardware'));

      return matchesSearch;
    });
  }, [products, search, selectedTab]);

  // Telemetry Aggregations
  const totalUnits = useMemo(() => products.reduce((acc, p) => acc + (Number(p.onHand ?? p.stock) || 0), 0), [products]);
  const totalValuation = useMemo(() => products.reduce((acc, p) => acc + ((Number(p.onHand ?? p.stock) || 0) * (Number(p.costPrice ?? p.purchasePrice) || 0)), 0), [products]);
  const lowStockCount = useMemo(() => products.filter(p => (Number(p.onHand ?? p.stock) || 0) <= (Number(p.reorderLevel ?? p.minStock) || 0)).length, [products]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* ── Page Header ──────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Inventory & Stock Balance Control
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>
            Physical on-hand counts, reserved quantities, reorder thresholds, and micro-component tracking.
          </p>
        </div>
      </div>

      {/* ── 3 Summary KPI Tiles ──────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <div className="erp-card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Stock On Hand
          </div>
          <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
            {totalUnits.toLocaleString()} Units
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            Across {products.length} catalog SKU items
          </div>
        </div>

        <div className="erp-card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Inventory Valuation
          </div>
          <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
            {formatCurrency ? formatCurrency(totalValuation) : `₹${totalValuation.toLocaleString()}`}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            Standard Cost Valuation Basis
          </div>
        </div>

        <div className="erp-card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Reorder Status
          </div>
          <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 700, color: lowStockCount > 0 ? '#b45309' : '#059669', marginTop: 4 }}>
            {lowStockCount > 0 ? `${lowStockCount} Items Below Threshold` : 'All Stock Nominal'}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            Automated purchase reorder trigger ready
          </div>
        </div>
      </div>

      {/* ── Toolbar & Tabs ───────────────────────────────────── */}
      <div className="erp-card" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        
        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: '3px', borderRadius: 6 }}>
          {TABS.map(tab => {
            const active = selectedTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                style={{
                  border: 'none',
                  background: active ? '#ffffff' : 'transparent',
                  color: active ? '#0f172a' : '#64748b',
                  fontSize: 12,
                  fontWeight: active ? 600 : 500,
                  padding: '4px 10px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  boxShadow: active ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.1s ease'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#ffffff', padding: '5px 10px',
          borderRadius: 6, border: '1px solid #cbd5e1', width: 280
        }}>
          <Search size={14} color="#64748b" />
          <input
            type="text"
            placeholder="Search inventory items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontSize: 12.5, color: '#0f172a', width: '100%'
            }}
          />
        </div>
      </div>

      {/* ── Stock Balance Table ──────────────────────────────── */}
      <div className="erp-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left', width: '120px' }}>SKU</th>
                <th style={{ textAlign: 'left' }}>Item Name</th>
                <th style={{ textAlign: 'left' }}>Category</th>
                <th style={{ textAlign: 'right' }}>On Hand</th>
                <th style={{ textAlign: 'right' }}>Reserved</th>
                <th style={{ textAlign: 'right' }}>Free To Use</th>
                <th style={{ textAlign: 'right' }}>Reorder Level</th>
                <th style={{ textAlign: 'right', width: '130px' }}>Quick Adjustment</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No inventory records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredStock.map(item => {
                  const onHand = Number(item.onHand ?? item.stock) || 0;
                  const reserved = Number(item.reserved) || 0;
                  const freeToUse = Math.max(0, onHand - reserved);
                  const reorder = Number(item.reorderLevel ?? item.minStock) || 0;
                  const isLow = onHand <= reorder;
                  const catName = typeof item.category === 'object' && item.category ? item.category.name : (item.category || 'General');

                  return (
                    <tr key={item.id || item._id}>
                      <td>
                        <span className="font-mono" style={{ fontSize: 12, fontWeight: 600, color: '#2563eb' }}>
                          {item.sku}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Unit: {item.unit || 'pcs'}</div>
                      </td>
                      <td style={{ color: '#475569', fontSize: 12.5 }}>
                        {catName}
                      </td>
                      <td className="tabular-nums" style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, color: isLow ? '#b45309' : '#0f172a' }}>
                          {onHand}
                        </span>
                      </td>
                      <td className="tabular-nums" style={{ textAlign: 'right', color: reserved > 0 ? '#2563eb' : '#64748b' }}>
                        {reserved}
                      </td>
                      <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600, color: freeToUse > 0 ? '#16a34a' : '#dc2626' }}>
                        {freeToUse}
                      </td>
                      <td className="tabular-nums" style={{ textAlign: 'right', color: '#64748b' }}>
                        {reorder}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            onClick={() => handleOpenAdjust(item, 'add')}
                            title="Stock In / Receive"
                            style={{
                              border: '1px solid #cbd5e1', background: '#ffffff',
                              borderRadius: 4, padding: '3px 8px', fontSize: 11.5,
                              fontWeight: 600, cursor: 'pointer', color: '#16a34a',
                              display: 'inline-flex', alignItems: 'center', gap: 3
                            }}
                          >
                            <PlusCircle size={12} /> In
                          </button>
                          <button
                            onClick={() => handleOpenAdjust(item, 'minus')}
                            title="Stock Out / Write-off"
                            style={{
                              border: '1px solid #cbd5e1', background: '#ffffff',
                              borderRadius: 4, padding: '3px 8px', fontSize: 11.5,
                              fontWeight: 600, cursor: 'pointer', color: '#dc2626',
                              display: 'inline-flex', alignItems: 'center', gap: 3
                            }}
                          >
                            <MinusCircle size={12} /> Out
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Stock Adjustment Modal ──────────────────────────── */}
      <AnimatePresence>
        {adjustModalItem && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              style={{
                width: '100%', maxWidth: 400, background: '#ffffff',
                borderRadius: 8, border: '1px solid #cbd5e1',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)', overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  {adjustType === 'add' ? 'Stock Receipt / Inward' : 'Stock Issue / Write-off'}
                </span>
                <button onClick={() => setAdjustModalItem(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleExecuteAdjust} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{adjustModalItem.name}</div>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>SKU: {adjustModalItem.sku} • Current On Hand: {adjustModalItem.onHand ?? adjustModalItem.stock ?? 0} {adjustModalItem.unit || 'units'}</div>
                </div>

                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Quantity to {adjustType === 'add' ? 'Add (+)' : 'Deduct (-)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjustDelta}
                    onChange={e => setAdjustDelta(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6, paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    onClick={() => setAdjustModalItem(null)}
                    style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '7px 16px', borderRadius: 6, border: 'none',
                      background: adjustType === 'add' ? '#16a34a' : '#dc2626',
                      color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Confirm {adjustType === 'add' ? 'Inward' : 'Outward'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}