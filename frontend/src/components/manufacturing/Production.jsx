import { useState, useMemo } from 'react';
import {
  Factory, Plus, Search, CheckCircle2, Clock, Trash2,
  X, AlertCircle, ArrowRight, Play, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useErp } from '../../context/ErpContext';

const WORK_CENTERS = [
  "Cutting & Sizing Bay",
  "Assembly Station",
  "Finishing & Polish Floor"
];

export default function Production() {
  const {
    workOrders = [],
    products = [],
    launchBatch,
    updateBatchProgress,
    completeBatch,
    deleteBatch
  } = useErp();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showLaunchModal, setShowLaunchModal] = useState(false);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [targetQty, setTargetQty] = useState('5');
  const [selectedLine, setSelectedLine] = useState(WORK_CENTERS[0]);

  const finishedGoods = useMemo(() => {
    return products.filter(p => p.type === 'Finished Good');
  }, [products]);

  const handleOpenLaunch = () => {
    const defaultProd = finishedGoods[0]?.id || finishedGoods[0]?._id || products[0]?.id || '';
    setSelectedProductId(defaultProd);
    setTargetQty('5');
    setSelectedLine(WORK_CENTERS[0]);
    setShowLaunchModal(true);
  };

  const handleLaunchSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductId) return alert("Select a product to manufacture");

    const payload = {
      productId: selectedProductId,
      targetQty: Number(targetQty) || 1,
      line: selectedLine,
      targetDate: new Date(Date.now() + 5 * 86400000).toISOString()
    };

    await launchBatch(payload);
    setShowLaunchModal(false);
  };

  const handleComplete = async (moId) => {
    if (window.confirm("Complete this work order? Raw materials will be consumed and finished goods added to stock.")) {
      await completeBatch(moId);
    }
  };

  // Filtered MOs
  const filteredOrders = useMemo(() => {
    return workOrders.filter(w => {
      const q = search.toLowerCase();
      const moNum = (w.moNumber || w.batchNumber || w.id || w._id || '').toLowerCase();
      const prodName = (w.productName || w.product?.name || '').toLowerCase();
      const matchesSearch = moNum.includes(q) || prodName.includes(q);

      const status = (w.status || 'PLANNED').toUpperCase();
      if (selectedStatus === 'Active') return matchesSearch && (status === 'IN_PROGRESS' || status === 'PLANNED');
      if (selectedStatus === 'Completed') return matchesSearch && status === 'COMPLETED';

      return matchesSearch;
    });
  }, [workOrders, search, selectedStatus]);

  const activeCount = useMemo(() => workOrders.filter(w => w.status !== 'COMPLETED' && w.status !== 'CANCELLED').length, [workOrders]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* ── Page Header ──────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Shop Floor & Manufacturing Orders
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>
            Work center operations, multi-level BoM explosion, component allocation, and production completion.
          </p>
        </div>

        <button
          onClick={handleOpenLaunch}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 6,
            background: '#2563eb', color: '#ffffff',
            fontSize: 12.5, fontWeight: 600, border: 'none', cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)'
          }}
        >
          <Plus size={14} /> Launch Manufacturing Order
        </button>
      </div>

      {/* ── Summary Tiles ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <div className="erp-card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Work Orders
          </div>
          <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 700, color: '#2563eb', marginTop: 4 }}>
            {activeCount} Batches In Progress
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            Work centers operating with allocated BoM stock
          </div>
        </div>

        <div className="erp-card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Finished Goods Master
          </div>
          <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
            {finishedGoods.length} Production Lines
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            Engineering recipes & BoM routings configured
          </div>
        </div>
      </div>

      {/* ── Filter Toolbar ───────────────────────────────────── */}
      <div className="erp-card" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: '3px', borderRadius: 6 }}>
          {['All', 'Active', 'Completed'].map(tab => {
            const active = selectedStatus === tab;
            return (
              <button
                key={tab}
                onClick={() => setSelectedStatus(tab)}
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

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#ffffff', padding: '5px 10px',
          borderRadius: 6, border: '1px solid #cbd5e1', width: 280
        }}>
          <Search size={14} color="#64748b" />
          <input
            type="text"
            placeholder="Search by MO # or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontSize: 12.5, color: '#0f172a', width: '100%'
            }}
          />
        </div>
      </div>

      {/* ── Manufacturing Orders Table ───────────────────────── */}
      <div className="erp-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left', width: '130px' }}>MO Number</th>
                <th style={{ textAlign: 'left' }}>Product Output</th>
                <th style={{ textAlign: 'left' }}>Work Center</th>
                <th style={{ textAlign: 'right' }}>Target Qty</th>
                <th style={{ textAlign: 'left' }}>Status</th>
                <th style={{ textAlign: 'right', width: '130px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No manufacturing orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(mo => {
                  const status = (mo.status || 'PLANNED').toUpperCase();
                  const isCompleted = status === 'COMPLETED';

                  return (
                    <tr key={mo.id || mo._id}>
                      <td>
                        <span className="font-mono" style={{ fontSize: 12, fontWeight: 600, color: '#2563eb' }}>
                          {mo.moNumber || mo.batchNumber || mo.id || 'MO-001'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                          {mo.productName || mo.product?.name || 'Solid Teak Dining Table'}
                        </div>
                      </td>
                      <td style={{ color: '#475569', fontSize: 12.5 }}>
                        {mo.line || 'Assembly Station'}
                      </td>
                      <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                        {mo.quantityToProduce || mo.targetQty || 5} units
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                          background: isCompleted ? '#ecfdf5' : '#eff6ff',
                          color: isCompleted ? '#059669' : '#2563eb'
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                          {status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {!isCompleted && (
                          <button
                            onClick={() => handleComplete(mo.id || mo._id)}
                            style={{
                              border: 'none', background: '#16a34a', color: '#fff',
                              borderRadius: 4, padding: '4px 8px', fontSize: 11.5,
                              fontWeight: 600, cursor: 'pointer'
                            }}
                          >
                            Produce FG
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Launch MO Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showLaunchModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              style={{
                width: '100%', maxWidth: 480, background: '#ffffff',
                borderRadius: 8, border: '1px solid #cbd5e1',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)', overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  Launch Manufacturing Order
                </span>
                <button onClick={() => setShowLaunchModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleLaunchSubmit} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Finished Good Product</label>
                  <select
                    required
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}
                  >
                    {finishedGoods.map(p => (
                      <option key={p.id || p._id} value={p.id || p._id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Target Quantity</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={targetQty}
                      onChange={e => setTargetQty(e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Work Center Routing</label>
                    <select
                      value={selectedLine}
                      onChange={e => setSelectedLine(e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}
                    >
                      {WORK_CENTERS.map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6, paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    onClick={() => setShowLaunchModal(false)}
                    style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '7px 16px', borderRadius: 6, border: 'none', background: '#2563eb', color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Release to Shop Floor
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
